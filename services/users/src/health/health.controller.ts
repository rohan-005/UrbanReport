import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'healthy',
      service: 'urbanreports-users-service',
      timestamp: new Date().toISOString(),
    };
  }
}
