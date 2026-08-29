import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateComplaintDto } from './create-complaint.dto';

describe('CreateComplaintDto Validation & Transformation', () => {
  it('should validate and transform valid complaint payload', async () => {
    const rawPayload = {
      category: 'Road Damage',
      title: 'Pothole on Main Street',
      description: 'Dangerous deep pothole near the intersection causing traffic jams.',
      severity: 'high',
      latitude: '12.9172',
      longitude: '77.6228',
      address: 'Outer Ring Road, Bengaluru',
      mediaIds: ['media-001'],
    };

    const dto = plainToInstance(CreateComplaintDto, rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.category).toBe('ROAD_DAMAGE');
    expect(dto.severity).toBe('HIGH');
    expect(typeof dto.latitude).toBe('number');
    expect(dto.latitude).toBe(12.9172);
    expect(typeof dto.longitude).toBe('number');
    expect(dto.longitude).toBe(77.6228);
  });

  it('should reject invalid title or short description', async () => {
    const rawPayload = {
      category: 'POTHOLE',
      title: 'Tiny',
      description: 'Too short',
      severity: 'MEDIUM',
      latitude: 12.9172,
      longitude: 77.6228,
      address: 'Test Address',
    };

    const dto = plainToInstance(CreateComplaintDto, rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const titleError = errors.find((e) => e.property === 'title');
    const descError = errors.find((e) => e.property === 'description');

    expect(titleError).toBeDefined();
    expect(descError).toBeDefined();
  });

  it('should reject out of bound coordinates', async () => {
    const rawPayload = {
      category: 'POTHOLE',
      title: 'Valid Complaint Title',
      description: 'Valid complaint description with sufficient length.',
      severity: 'MEDIUM',
      latitude: 195.0, // Invalid latitude > 90
      longitude: 77.6228,
      address: 'Test Address',
    };

    const dto = plainToInstance(CreateComplaintDto, rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const latError = errors.find((e) => e.property === 'latitude');
    expect(latError).toBeDefined();
  });
});
