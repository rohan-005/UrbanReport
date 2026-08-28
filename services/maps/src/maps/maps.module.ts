import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { MaptilerService } from './maptiler.service';

@Module({
  controllers: [MapsController],
  providers: [MapsService, MaptilerService],
  exports: [MapsService, MaptilerService],
})
export class MapsModule {}
