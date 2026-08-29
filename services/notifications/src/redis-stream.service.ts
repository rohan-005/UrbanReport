import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';

export interface DomainNotificationEvent {
  eventId: string;
  eventType: string;
  occurredAt: string;
  complaintId: string;
  reporterUserId: string;
  actorUserId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class RedisStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisStreamService.name);
  private redisClient: Redis | null = null;
  private streamKey: string = 'urbanreports.notifications';
  private groupName: string = 'urbanreports-notification-workers';
  private consumerName: string = `worker-${Math.random().toString(36).substring(2, 8)}`;
  private isRedisConnected: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.streamKey = this.configService.get<string>('REDIS_NOTIFICATION_STREAM', 'urbanreports.notifications');
  }

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 3 });
        await this.redisClient.connect();
        this.isRedisConnected = true;
        this.logger.log(`Connected to Redis Stream at ${redisUrl.replace(/:[^:@]+@/, ':****@')}`);
        await this.setupConsumerGroup();
      } catch (err: any) {
        this.logger.warn(`Redis connection failed (${err.message}). Falling back to internal event emitter bus.`);
        this.isRedisConnected = false;
      }
    } else {
      this.logger.log('Redis URL unconfigured. Operating with internal event transport bus.');
    }
  }

  private async setupConsumerGroup() {
    if (!this.redisClient || !this.isRedisConnected) return;
    try {
      await this.redisClient.xgroup('CREATE', this.streamKey, this.groupName, '$', 'MKSTREAM');
      this.logger.log(`Created consumer group '${this.groupName}' for stream '${this.streamKey}'`);
    } catch (err: any) {
      if (!err.message.includes('BUSYGROUP')) {
        this.logger.warn(`Consumer group setup notice: ${err.message}`);
      }
    }
  }

  async publishEvent(event: DomainNotificationEvent): Promise<boolean> {
    this.logger.log(`[Event Transport Published] Event: ${event.eventType} | ID: ${event.eventId} | Complaint: ${event.complaintId}`);

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.xadd(
          this.streamKey,
          '*',
          'payload',
          JSON.stringify(event),
        );
        return true;
      } catch (err: any) {
        this.logger.warn(`Failed to publish event to Redis Stream: ${err.message}. Emitting to fallback event bus.`);
      }
    }

    // Fallback: local EventEmitter2
    this.eventEmitter.emit('domain.notification', event);
    return true;
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
