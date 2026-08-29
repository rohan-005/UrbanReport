import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { TemplateService } from './templates/template.service';
import { RedisStreamService } from './redis-stream.service';
import { NotificationWorkerService } from './notification-worker.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [NotificationsController],
  providers: [
    EmailService,
    TemplateService,
    RedisStreamService,
    NotificationWorkerService,
  ],
  exports: [EmailService, RedisStreamService],
})
export class AppModule {}
