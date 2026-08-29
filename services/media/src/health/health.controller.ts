import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { GridFsService } from '../media/gridfs.service';

@Controller('health')
export class HealthController {
  constructor(private readonly gridFsService: GridFsService) {}

  @Get()
  getHealth(@Res() res: Response) {
    const isReady = this.gridFsService.isReady();
    const status = isReady ? 'healthy' : 'unhealthy';
    const statusCode = isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status,
      service: 'urbanreports-media-service',
      storage: isReady ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
}
