import { Controller, Get, Query } from '@nestjs/common';
import { MapsService } from './maps.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { ReverseQueryDto } from './dto/reverse-query.dto';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('search')
  async searchPlaces(@Query() dto: SearchQueryDto) {
    return this.mapsService.search(dto.q);
  }

  @Get('reverse')
  async reverseGeocode(@Query() dto: ReverseQueryDto) {
    return this.mapsService.reverseGeocode(dto.lat, dto.lng);
  }
}
