import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Media, MediaDocument, ProcessingStatus } from './schemas/media.schema';
import { GridFsService } from './gridfs.service';
import * as crypto from 'crypto';
import imageSize from 'image-size';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger('MediaService');
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly gridFsService: GridFsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates uploaded file MIME type, magic numbers, and size limit.
   */
  validateFile(file: Express.Multer.File): void {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Empty or missing file upload payload.');
    }

    const maxSizeBytes =
      parseInt(this.configService.get<string>('MAX_IMAGE_SIZE') || '10485760', 10) || 10485760;

    if (file.size > maxSizeBytes) {
      throw new PayloadTooLargeException(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of ${(
          maxSizeBytes /
          (1024 * 1024)
        ).toFixed(2)}MB.`,
      );
    }

    const mime = file.mimetype ? file.mimetype.toLowerCase() : '';
    if (!this.allowedMimeTypes.includes(mime)) {
      throw new UnsupportedMediaTypeException(
        `Unsupported media type '${mime}'. Allowed types: JPEG, PNG, WEBP.`,
      );
    }

    // Verify magic number / buffer signature
    const buf = file.buffer;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const isPng =
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a;
    const isWebp =
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50;

    if (!isJpeg && !isPng && !isWebp) {
      throw new BadRequestException(
        'Invalid or corrupted file content. File header signature does not match image format.',
      );
    }
  }

  /**
   * Server-side SHA-256 checksum calculation
   */
  calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Server-side image dimensions extraction
   */
  extractDimensions(buffer: Buffer): { width: number; height: number } {
    try {
      const dimensions = imageSize(buffer);
      return {
        width: dimensions.width || 0,
        height: dimensions.height || 0,
      };
    } catch {
      return { width: 0, height: 0 };
    }
  }

  /**
   * Upload image binary to GridFS & persist media metadata in MongoDB
   */
  async uploadMedia(file: Express.Multer.File, ownerUserId: string): Promise<Media> {
    this.validateFile(file);

    const mediaId = `med_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const checksum = this.calculateChecksum(file.buffer);
    const dimensions = this.extractDimensions(file.buffer);

    this.logger.log(`Processing media upload: ${mediaId} (owner: ${ownerUserId}, size: ${file.size} bytes)`);

    let gridFsFileId: Types.ObjectId;
    try {
      gridFsFileId = await this.gridFsService.uploadFile(
        `${mediaId}_${file.originalname}`,
        file.buffer,
        file.mimetype,
        {
          mediaId,
          owner: ownerUserId,
          checksum,
        },
      );
    } catch (err: any) {
      this.logger.error(`GridFS upload failed for ${mediaId}: ${err.message}`);
      throw new BadRequestException(`Storage service error during image upload: ${err.message}`);
    }

    try {
      const mediaRecord = await this.mediaModel.create({
        mediaId,
        owner: ownerUserId,
        gridFsFileId,
        mimeType: file.mimetype,
        fileName: file.originalname,
        size: file.size,
        dimensions,
        checksum,
        processingStatus: ProcessingStatus.READY,
      });

      this.logger.log(`Media upload completed successfully: ${mediaId}`);
      return mediaRecord;
    } catch (err: any) {
      this.logger.error(`Metadata persistence failed for ${mediaId}. Cleaning up GridFS file.`);
      if (gridFsFileId) {
        await this.gridFsService.deleteFile(gridFsFileId).catch(() => {});
      }
      throw new BadRequestException('Failed to record media metadata.');
    }
  }

  /**
   * Get metadata record by media ID
   */
  async getMediaMetadata(mediaId: string): Promise<Media> {
    const record = await this.mediaModel.findOne({ mediaId }).exec();
    if (!record) {
      throw new NotFoundException(`Media record '${mediaId}' not found.`);
    }
    return record;
  }

  /**
   * Associate uploaded media with a complaint ID
   */
  async associateComplaint(mediaId: string, complaintId: string, actorUserId: string): Promise<Media> {
    const record = await this.mediaModel.findOne({ mediaId }).exec();
    if (!record) {
      throw new NotFoundException(`Media record '${mediaId}' not found.`);
    }

    record.complaintId = complaintId;
    return record.save();
  }

  /**
   * Validate authorization for accessing/streaming media
   */
  async validateAccessAuthorization(mediaId: string, requester: { userId: string; role: string }): Promise<Media> {
    const record = await this.getMediaMetadata(mediaId);

    // Authorized if owner, admin/officer, or if media is associated with a public complaint
    const isOwner = record.owner === requester.userId;
    const isOfficerOrAdmin = ['ADMIN', 'OFFICER', 'AUTHORITY'].includes(requester.role);
    const isPublicComplaintMedia = Boolean(record.complaintId);

    if (!isOwner && !isOfficerOrAdmin && !isPublicComplaintMedia) {
      if (record.processingStatus !== ProcessingStatus.READY) {
        throw new ForbiddenException('Access denied to restricted media resource.');
      }
    }

    return record;
  }

  /**
   * Stream GridFS file binary
   */
  async getMediaStream(mediaId: string) {
    const record = await this.getMediaMetadata(mediaId);
    if (!record.gridFsFileId) {
      throw new NotFoundException(`GridFS binary reference missing for media record '${mediaId}'.`);
    }
    const stream = this.gridFsService.downloadStream(record.gridFsFileId.toString());
    return {
      stream,
      record,
    };
  }

  /**
   * Delete GridFS object and metadata record
   */
  async deleteMedia(mediaId: string, requester: { userId: string; role: string }): Promise<{ success: boolean }> {
    const record = await this.getMediaMetadata(mediaId);

    const isOwner = record.owner === requester.userId;
    const isAdmin = ['ADMIN', 'AUTHORITY'].includes(requester.role);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this media asset.');
    }

    try {
      if (record.gridFsFileId) {
        await this.gridFsService.deleteFile(record.gridFsFileId.toString());
      }
    } catch (err: any) {
      this.logger.warn(`GridFS file deletion warning for ${mediaId}: ${err.message}`);
    }

    await this.mediaModel.deleteOne({ mediaId }).exec();
    this.logger.log(`Deleted media asset: ${mediaId} by user ${requester.userId}`);

    return { success: true };
  }
}
