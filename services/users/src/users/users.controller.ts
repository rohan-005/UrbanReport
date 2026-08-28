import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    const user = req.user;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      aadhaarNumber: user.aadhaarMasked,
      avatar: user.avatar,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Patch('me')
  async updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
    const updated: any = await this.usersService.updateProfile(req.user._id, dto);
    return {
      id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      aadhaarNumber: updated.aadhaarMasked,
      avatar: updated.avatar,
      notificationPreferences: updated.notificationPreferences,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  @Get('me/notification-preferences')
  async getNotificationPreferences(@Request() req: any) {
    return req.user.notificationPreferences;
  }

  @Patch('me/notification-preferences')
  async updateNotificationPreferences(
    @Request() req: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const updated = await this.usersService.updateNotificationPreferences(
      req.user._id,
      dto,
    );
    return updated.notificationPreferences;
  }
}
