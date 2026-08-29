import { Controller, Get, Post, Body } from '@nestjs/common';
import { RedisStreamService, DomainNotificationEvent } from './redis-stream.service';
import { EmailService } from './email.service';

@Controller()
export class NotificationsController {
  constructor(
    private readonly redisStream: RedisStreamService,
    private readonly emailService: EmailService,
  ) {}

  @Get('health')
  getHealth() {
    return { status: 'OK', service: 'notifications-worker', timestamp: new Date().toISOString() };
  }

  @Post('events')
  async handleEvent(@Body() event: DomainNotificationEvent) {
    const success = await this.redisStream.publishEvent(event);
    return { success, eventId: event.eventId };
  }

  @Get('admin/smtp-test')
  async testSmtp() {
    return this.emailService.testSmtpConnection();
  }
}
