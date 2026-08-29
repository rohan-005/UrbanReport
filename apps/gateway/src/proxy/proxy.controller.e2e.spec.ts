import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { CreateComplaintDto } from './dto/create-complaint.dto';

describe('ProxyController POST /api/complaints Integration Test', () => {
  let controller: ProxyController;
  let mockProxyService: Partial<ProxyService>;
  let validationPipe: ValidationPipe;

  beforeEach(() => {
    mockProxyService = {
      forwardPost: jest.fn().mockImplementation((url: string, payload: any) => {
        return Promise.resolve({ success: true, forwardedUrl: url, forwardedPayload: payload });
      }),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'COMPLAINTS_SERVICE_URL') return 'http://localhost:3002';
        return null;
      }),
    } as any;

    controller = new ProxyController(
      mockProxyService as ProxyService,
      mockConfigService as ConfigService,
    );

    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

  it('should pass valid complaint payload through ValidationPipe and forward to complaints service', async () => {
    const rawBody = {
      category: 'Pothole',
      title: 'Large pothole on main road',
      description: 'A large pothole is causing traffic and creating a safety hazard.',
      severity: 'High',
      latitude: 28.123456,
      longitude: 77.123456,
      address: 'Outer Ring Road, Bengaluru',
    };

    const validatedDto = (await validationPipe.transform(rawBody, {
      type: 'body',
      metatype: CreateComplaintDto,
    })) as CreateComplaintDto;

    const mockReq = { headers: {} } as any;
    const result = await controller.createComplaint(validatedDto, mockReq);

    expect(result.success).toBe(true);
    expect(result.forwardedUrl).toBe('http://localhost:3002/complaints');
    expect(result.forwardedPayload).toEqual({
      category: 'POTHOLE',
      title: 'Large pothole on main road',
      description: 'A large pothole is causing traffic and creating a safety hazard.',
      severity: 'HIGH',
      latitude: 28.123456,
      longitude: 77.123456,
      address: 'Outer Ring Road, Bengaluru',
      mediaIds: undefined,
    });
  });

  it('should reject invalid complaint payload in ValidationPipe with error array', async () => {
    const invalidRawBody = {
      category: 'INVALID_CAT',
      title: 'Tiny',
      description: 'Short',
      severity: 'INVALID_SEV',
      latitude: 200,
      longitude: 300,
      address: '',
    };

    try {
      await validationPipe.transform(invalidRawBody, {
        type: 'body',
        metatype: CreateComplaintDto,
      });
      fail('ValidationPipe should have thrown BadRequestException');
    } catch (err: any) {
      const response = err.getResponse();
      expect(response.statusCode).toBe(400);
      expect(Array.isArray(response.message)).toBe(true);
      expect(response.message.length).toBeGreaterThan(0);
    }
  });
});
