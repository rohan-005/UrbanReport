import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { maskAadhaar, validateAadhaarFormat } from './utils/aadhaar-validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (!validateAadhaarFormat(dto.aadhaar)) {
      throw new BadRequestException('Invalid Aadhaar 12-digit format pattern.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const aadhaarMasked = maskAadhaar(dto.aadhaar);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      aadhaarMasked,
    });

    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const envAdminId = (process.env.ADMIN_ID || 'admin@urbanreports.gov.in').trim();
    const envAdminPass = (process.env.ADMIN_PASSWORD || 'change_me').trim();

    const inputEmail = (dto.email || '').trim().toLowerCase();
    const isAdminEmailMatch =
      inputEmail === envAdminId.toLowerCase() ||
      inputEmail === 'admin' ||
      inputEmail === 'admin@urbanreports.gov.in';

    if (isAdminEmailMatch && dto.password === envAdminPass) {
      const payload = { sub: 'admin-001', role: 'ADMIN' };
      const accessToken = this.jwtService.sign(payload);
      return {
        accessToken,
        user: {
          id: 'admin-001',
          name: 'System Administrator',
          email: envAdminId,
          phone: '+91 99999 00000',
          role: 'ADMIN',
          aadhaarNumber: 'XXXX-XXXX-9999',
          avatar: undefined,
          notificationPreferences: {
            complaintUpdates: true,
            resolutionNotifications: true,
            assignmentUpdates: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      // Generic error message to prevent email enumeration attacks
      throw new UnauthorizedException('Invalid email address or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.passwordHash;
    delete obj.__v;
    return {
      id: obj._id.toString(),
      name: obj.name,
      email: obj.email,
      phone: obj.phone,
      role: obj.role,
      aadhaarNumber: obj.aadhaarMasked,
      avatar: obj.avatar,
      notificationPreferences: obj.notificationPreferences,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
