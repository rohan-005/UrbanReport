import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'healthy',
      service: 'urbanreports-maps-service',
      timestamp: new Date().toISOString(),
    };
  }
}
