import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'urbanreports_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: { sub: string; role: string }) {
    if (payload.sub === 'admin-001' || payload.role === 'ADMIN') {
      const envAdminId = process.env.ADMIN_ID || 'admin@urbanreports.gov.in';
      return {
        _id: 'admin-001',
        name: 'System Administrator',
        email: envAdminId,
        phone: '+91 99999 00000',
        role: 'ADMIN',
        aadhaarMasked: 'XXXX-XXXX-9999',
        notificationPreferences: {
          complaintUpdates: true,
          resolutionNotifications: true,
          assignmentUpdates: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }
    return user;
  }
}
