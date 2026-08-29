import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFsService implements OnModuleInit {
  private readonly logger = new Logger('GridFsService');
  private bucket: GridFSBucket | null = null;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.initBucket();
  }

  private initBucket(): boolean {
    if (this.bucket) {
      return true;
    }

    const bucketName = this.configService.get<string>('GRIDFS_BUCKET') || 'complaint_media';

    // 1. Connection is ready and active DB object exists
    if (this.connection.readyState === 1 && this.connection.db) {
      this.bucket = new GridFSBucket(this.connection.db, { bucketName });
      this.logger.log(`MongoDB GridFS initialized successfully with bucket: '${bucketName}'`);
      return true;
    }

    // 2. Connection is connecting; attach listener for when connection opens
    if (!this.connection.listeners('open').includes(this.onConnectionOpen)) {
      this.connection.once('open', this.onConnectionOpen);
    }
    if (!this.connection.listeners('connected').includes(this.onConnectionOpen)) {
      this.connection.once('connected', this.onConnectionOpen);
    }

    return false;
  }

  private onConnectionOpen = () => {
    const bucketName = this.configService.get<string>('GRIDFS_BUCKET') || 'complaint_media';
    if (this.connection.db && !this.bucket) {
      this.bucket = new GridFSBucket(this.connection.db, { bucketName });
      this.logger.log(
        `MongoDB connection established. GridFS initialized successfully with bucket: '${bucketName}'`,
      );
    }
  };

  public isReady(): boolean {
    if (this.bucket && this.connection.readyState === 1 && this.connection.db) {
      return true;
    }
    return this.initBucket();
  }

  private getBucket(): GridFSBucket {
    if (!this.isReady() || !this.bucket) {
      throw new ServiceUnavailableException(
        'MongoDB GridFS storage service is not ready or connected.',
      );
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
        reject(new InternalServerErrorException(`GridFS file upload failed: ${err.message}`));
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
