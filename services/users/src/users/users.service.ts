import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, NotificationPreferences } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    aadhaarMasked?: string;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('That email address is already registered.');
    }

    const createdUser = new this.userModel({
      ...data,
      email: data.email.toLowerCase(),
      role: 'CITIZEN', // Always default to CITIZEN for public registration
      notificationPreferences: {
        complaintUpdates: true,
        resolutionNotifications: true,
        assignmentUpdates: true,
      },
    });

    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async updateProfile(
    id: string,
    updates: { name?: string; phone?: string; avatar?: string },
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User profile not found.');
    return user;
  }

  async updateNotificationPreferences(
    id: string,
    prefs: Partial<NotificationPreferences>,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { notificationPreferences: prefs } },
        { new: true },
      )
      .exec();
    if (!user) throw new NotFoundException('User profile not found.');
    return user;
  }
}
