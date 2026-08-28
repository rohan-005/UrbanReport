import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MediaDocument = Media & Document;

export enum ProcessingStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'media_metadata' })
export class Media {
  @Prop({ required: true, unique: true, index: true })
  mediaId: string;

  @Prop({ required: true, index: true })
  owner: string;

  @Prop({ required: false, index: true, default: null })
  complaintId?: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  gridFsFileId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Object, required: false, default: { width: 0, height: 0 } })
  dimensions: { width: number; height: number };

  @Prop({ required: true })
  checksum: string;

  @Prop({
    type: String,
    enum: ProcessingStatus,
    default: ProcessingStatus.READY,
  })
  processingStatus: ProcessingStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
