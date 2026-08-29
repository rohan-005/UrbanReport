import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [HealthController],
})
export class HealthModule {}
