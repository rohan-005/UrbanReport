import { Test, TestingModule } from '@nestjs/testing';
import { MapsService } from './maps.service';
import { MaptilerService } from './maptiler.service';
import { BadRequestException } from '@nestjs/common';

describe('MapsService', () => {
  let service: MapsService;
  let mockMaptilerService: any;

  beforeEach(async () => {
    mockMaptilerService = {
      searchPlaces: jest.fn().mockImplementation((q) =>
        Promise.resolve([
          {
            id: 'p-1',
            placeName: 'Silk Board',
            address: 'Silk Board Junction',
            latitude: 12.9172,
            longitude: 77.6228,
          },
        ]),
      ),
      reverseGeocode: jest.fn().mockImplementation((lat, lng) =>
        Promise.resolve({
          address: `Location at ${lat}° N, ${lng}° E`,
          placeName: 'Selected Coordinates',
          latitude: lat,
          longitude: lng,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapsService,
        { provide: MaptilerService, useValue: mockMaptilerService },
      ],
    }).compile();

    service = module.get<MapsService>(MapsService);
  });

  describe('search', () => {
    it('should return search results for valid query', async () => {
      const results = await service.search('Silk Board');
      expect(results).toHaveLength(1);
      expect(results[0].placeName).toBe('Silk Board');
      expect(mockMaptilerService.searchPlaces).toHaveBeenCalledWith('Silk Board');
    });

    it('should throw BadRequestException if query is empty string', async () => {
      await expect(service.search('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reverseGeocode', () => {
    it('should return reverse geocoding result for valid coordinates', async () => {
      const res = await service.reverseGeocode(12.9172, 77.6228);
      expect(res.latitude).toBe(12.9172);
      expect(res.longitude).toBe(77.6228);
      expect(mockMaptilerService.reverseGeocode).toHaveBeenCalledWith(12.9172, 77.6228);
    });

    it('should throw BadRequestException for invalid latitude (> 90)', async () => {
      await expect(service.reverseGeocode(100, 77.6228)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid longitude (< -180)', async () => {
      await expect(service.reverseGeocode(12.9172, -200)).rejects.toThrow(BadRequestException);
    });
  });
});
