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
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Media, MediaDocument, ProcessingStatus } from './schemas/media.schema';
import { CloudinaryService } from './cloudinary.service';
import * as crypto from 'crypto';
import imageSize from 'image-size';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger('MediaService');
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly cloudinaryService: CloudinaryService,
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
   * Upload image to Cloudinary & persist media metadata in MongoDB
   */
  async uploadMedia(file: Express.Multer.File, ownerUserId: string): Promise<Media> {
    this.validateFile(file);

    const mediaId = `med_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const checksum = this.calculateChecksum(file.buffer);
    const extractedDimensions = this.extractDimensions(file.buffer);

    this.logger.log(`Processing media upload to Cloudinary: ${mediaId} (owner: ${ownerUserId}, size: ${file.size} bytes)`);

    const fileDataBase64 = file.buffer ? file.buffer.toString('base64') : undefined;

    let cloudinaryResult: {
      publicId: string;
      secureUrl: string;
      format: string;
      bytes: number;
      width: number;
      height: number;
    } | undefined;

    try {
      cloudinaryResult = await this.cloudinaryService.uploadImage(file.buffer, mediaId, file.mimetype);
    } catch (err: any) {
      this.logger.warn(`Cloudinary upload failed for ${mediaId}: ${err.message}. Falling back to local buffer storage.`);
    }

    const isStubUrl = cloudinaryResult?.secureUrl?.includes('urbanreports-demo');
    const finalCloudinaryUrl = (!cloudinaryResult || isStubUrl)
      ? `/api/media/${mediaId}`
      : cloudinaryResult.secureUrl;

    try {
      const mediaRecord = await this.mediaModel.create({
        mediaId,
        owner: ownerUserId,
        cloudinaryPublicId: cloudinaryResult?.publicId || `local/${mediaId}`,
        cloudinaryUrl: finalCloudinaryUrl,
        fileData: fileDataBase64,
        mimeType: file.mimetype,
        fileName: file.originalname,
        size: cloudinaryResult?.bytes || file.size,
        dimensions: {
          width: cloudinaryResult?.width || extractedDimensions.width,
          height: cloudinaryResult?.height || extractedDimensions.height,
        },
        checksum,
        processingStatus: ProcessingStatus.READY,
      });

      this.logger.log(`Media upload completed successfully: ${mediaId}`);
      return mediaRecord;
    } catch (err: any) {
      this.logger.error(`Metadata persistence failed for ${mediaId}.`);
      if (cloudinaryResult && cloudinaryResult.publicId && !isStubUrl) {
        await this.cloudinaryService.deleteImage(cloudinaryResult.publicId).catch(() => {});
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
   * Validate authorization for accessing media
   */
  async validateAccessAuthorization(mediaId: string, requester: { userId: string; role: string }): Promise<Media> {
    const record = await this.getMediaMetadata(mediaId);

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
   * Resolve media resource: returns redirect URL (for real Cloudinary asset) or binary buffer
   */
  async getMediaResource(mediaId: string): Promise<{ redirectUrl?: string; buffer?: Buffer; mimeType?: string; record?: Media }> {
    const record = await this.mediaModel.findOne({ mediaId }).exec();
    if (!record) {
      throw new NotFoundException(`Media record '${mediaId}' not found.`);
    }

    const isExternalCloudinary =
      record.cloudinaryUrl &&
      record.cloudinaryUrl.startsWith('http') &&
      !record.cloudinaryUrl.includes('urbanreports-demo');

    if (isExternalCloudinary) {
      return { redirectUrl: record.cloudinaryUrl, record };
    }

    if (record.fileData) {
      const buffer = Buffer.from(record.fileData, 'base64');
      return { buffer, mimeType: record.mimeType, record };
    }

    throw new NotFoundException(`Binary data unavailable for media '${mediaId}'.`);
  }

  /**
   * Resolve Cloudinary secure URL for media ID
   */
  async getMediaUrl(mediaId: string): Promise<{ url: string; record: Media }> {
    const record = await this.getMediaMetadata(mediaId);
    return {
      url: record.cloudinaryUrl || `/api/media/${mediaId}`,
      record,
    };
  }

  /**
   * Generate clean SVG fallback image when media resource is unavailable or missing
   */
  generateFallbackSvg(mediaId: string): Buffer {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#f5f3ee"/>
      <rect x="20" y="20" width="760" height="560" rx="8" fill="none" stroke="#e2dfd7" stroke-width="4" stroke-dasharray="8 8"/>
      <circle cx="400" cy="250" r="44" fill="#e2dfd7"/>
      <path d="M382 232 h36 v36 h-36 z" fill="#877b5f"/>
      <text x="400" y="350" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#3f4636" text-anchor="middle">Civic Dossier Photo Evidence</text>
      <text x="400" y="385" font-family="monospace" font-size="14" fill="#6b7280" text-anchor="middle">RESOURCE: ${mediaId}</text>
    </svg>`;
    return Buffer.from(svg, 'utf-8');
  }

  /**
   * Delete Cloudinary asset and metadata record
   */
  async deleteMedia(mediaId: string, requester: { userId: string; role: string }): Promise<{ success: boolean }> {
    const record = await this.getMediaMetadata(mediaId);

    const isOwner = record.owner === requester.userId;
    const isAdmin = ['ADMIN', 'AUTHORITY'].includes(requester.role);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this media asset.');
    }

    try {
      if (record.cloudinaryPublicId && !record.cloudinaryPublicId.startsWith('local/')) {
        await this.cloudinaryService.deleteImage(record.cloudinaryPublicId);
      }
    } catch (err: any) {
      this.logger.warn(`Cloudinary asset deletion warning for ${mediaId}: ${err.message}`);
    }

    await this.mediaModel.deleteOne({ mediaId }).exec();
    this.logger.log(`Deleted media asset: ${mediaId} by user ${requester.userId}`);

    return { success: true };
  }
}
