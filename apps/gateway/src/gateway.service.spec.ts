import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy/proxy.service';
import { ConfigService } from '@nestjs/config';

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'USERS_SERVICE_URL') return 'http://localhost:3001';
              if (key === 'COMPLAINTS_SERVICE_URL') return 'http://localhost:3002';
              if (key === 'MEDIA_SERVICE_URL') return 'http://localhost:3003';
              if (key === 'MAPS_SERVICE_URL') return 'http://localhost:3004';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
