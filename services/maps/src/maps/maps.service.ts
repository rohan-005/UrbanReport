import { Injectable, BadRequestException } from '@nestjs/common';
import { MaptilerService, PlaceSearchResult, ReverseGeocodeResult } from './maptiler.service';

@Injectable()
export class MapsService {
  constructor(private readonly maptilerService: MaptilerService) {}

  async search(query: string): Promise<PlaceSearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query parameter "q" cannot be empty.');
    }
    return this.maptilerService.searchPlaces(query.trim());
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new BadRequestException('Latitude must be a valid number between -90 and 90.');
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new BadRequestException('Longitude must be a valid number between -180 and 180.');
    }

    return this.maptilerService.reverseGeocode(lat, lng);
  }
}
