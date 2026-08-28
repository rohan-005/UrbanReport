import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getHealth() {
    const usersUrl = this.configService.get<string>('USERS_SERVICE_URL') || 'http://localhost:3001';
    const complaintsUrl = this.configService.get<string>('COMPLAINTS_SERVICE_URL') || 'http://localhost:3002';
    const mediaUrl = this.configService.get<string>('MEDIA_SERVICE_URL') || 'http://localhost:3003';
    const mapsUrl = this.configService.get<string>('MAPS_SERVICE_URL') || 'http://localhost:3004';

    return {
      status: 'healthy',
      service: 'urbanreports-api-gateway',
      timestamp: new Date().toISOString(),
      downstream: {
        usersService: usersUrl,
        complaintsService: complaintsUrl,
        mediaService: mediaUrl,
        mapsService: mapsUrl,
      },
    };
  }
}
