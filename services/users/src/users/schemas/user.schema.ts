import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRole = 'CITIZEN' | 'OFFICER' | 'AUTHORITY' | 'ADMIN';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ default: true })
  complaintUpdates: boolean;

  @Prop({ default: true })
  resolutionNotifications: boolean;

  @Prop({ default: true })
  assignmentUpdates: boolean;
}

export const NotificationPreferencesSchema =
  SchemaFactory.createForClass(NotificationPreferences);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({
    required: true,
    enum: ['CITIZEN', 'OFFICER', 'AUTHORITY', 'ADMIN'],
    default: 'CITIZEN',
  })
  role: UserRole;

  @Prop({ required: false, trim: true })
  aadhaarMasked?: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ type: NotificationPreferencesSchema, default: () => ({}) })
  notificationPreferences: NotificationPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
