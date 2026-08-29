import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { ComplaintsRepository } from './complaints.repository';
import { ComplaintLifecycleService } from './complaint-lifecycle.service';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'urbanreports_super_secret_jwt_key_2026',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [ComplaintsController],
  providers: [
    ComplaintsService,
    ComplaintsRepository,
    ComplaintLifecycleService,
    DuplicateDetectionService,
    JwtStrategy,
  ],
  exports: [ComplaintsService, DuplicateDetectionService],
})
export class ComplaintsModule {}
