import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CloudinaryService } from '../media/cloudinary.service';

@Controller('health')
export class HealthController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get()
  getHealth(@Res() res: Response) {
    const isCloudinaryConfigured = this.cloudinaryService.isConfigured();

    return res.status(HttpStatus.OK).json({
      status: 'healthy',
      service: 'urbanreports-media-service',
      storageProvider: 'Cloudinary',
      cloudinaryConfigured: isCloudinaryConfigured,
      timestamp: new Date().toISOString(),
    });
  }
}
