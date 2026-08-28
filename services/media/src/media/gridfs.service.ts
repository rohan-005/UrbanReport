import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFsService implements OnModuleInit {
  private readonly logger = new Logger('GridFsService');
  private bucket: GridFSBucket;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const bucketName = this.configService.get<string>('GRIDFS_BUCKET') || 'complaint_media';
    if (!this.connection.db) {
      this.logger.error('MongoDB database connection is not ready for GridFS initialization.');
      return;
    }
    this.bucket = new GridFSBucket(this.connection.db, { bucketName });
    this.logger.log(`MongoDB GridFS initialized with bucket: '${bucketName}'`);
  }

  private getBucket(): GridFSBucket {
    if (!this.bucket) {
      const bucketName = this.configService.get<string>('GRIDFS_BUCKET') || 'complaint_media';
      this.bucket = new GridFSBucket(this.connection.db, { bucketName });
    }
    return this.bucket;
  }

  async uploadFile(
    filename: string,
    buffer: Buffer,
    contentType: string,
    metadata: Record<string, any>,
  ): Promise<ObjectId> {
    const bucket = this.getBucket();
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: {
          ...metadata,
          uploadedAt: new Date(),
        },
      });

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);

      uploadStream.on('finish', () => {
        resolve(uploadStream.id as ObjectId);
      });

      uploadStream.on('error', (err) => {
        this.logger.error(`GridFS upload failed: ${err.message}`);
        reject(err);
      });

      readable.pipe(uploadStream);
    });
  }

  downloadStream(fileId: ObjectId | string) {
    const bucket = this.getBucket();
    const oid = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    return bucket.openDownloadStream(oid);
  }

  async deleteFile(fileId: ObjectId | string): Promise<void> {
    const bucket = this.getBucket();
    const oid = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    await bucket.delete(oid);
  }

  async getFileInfo(fileId: ObjectId | string): Promise<any> {
    const bucket = this.getBucket();
    const oid = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    const files = await bucket.find({ _id: oid }).toArray();
    return files.length > 0 ? files[0] : null;
  }
}
