import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateComplaintDto } from './dto/create-complaint.dto';

describe('Gateway CreateComplaintDto Validation & Transformation', () => {
  it('should validate and transform a valid complaint request payload', async () => {
    const rawPayload = {
      category: 'Pothole',
      title: 'Large pothole on main road',
      description: 'A large pothole is causing traffic and creating a safety hazard.',
      severity: 'High',
      latitude: '28.123456',
      longitude: '77.123456',
      address: 'Outer Ring Road, Bengaluru',
      mediaIds: ['media-123'],
    };

    const dto = plainToInstance(CreateComplaintDto, rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.category).toBe('POTHOLE');
    expect(dto.title).toBe('Large pothole on main road');
    expect(dto.description).toBe('A large pothole is causing traffic and creating a safety hazard.');
    expect(dto.severity).toBe('HIGH');
    expect(typeof dto.latitude).toBe('number');
    expect(dto.latitude).toBe(28.123456);
    expect(typeof dto.longitude).toBe('number');
    expect(dto.longitude).toBe(77.123456);
    expect(dto.address).toBe('Outer Ring Road, Bengaluru');
  });

  it('should reject invalid title < 5 chars or description < 10 chars', async () => {
    const rawPayload = {
      category: 'POTHOLE',
      title: 'Bad',
      description: 'Short',
      severity: 'HIGH',
      latitude: 28.123,
      longitude: 77.123,
      address: 'Some Address',
    };

    const dto = plainToInstance(CreateComplaintDto, rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const titleError = errors.find((e) => e.property === 'title');
    const descError = errors.find((e) => e.property === 'description');

    expect(titleError).toBeDefined();
    expect(descError).toBeDefined();
  });

  it('should reject invalid coordinates outside bounding limits', async () => {
    const rawPayload = {
      category: 'POTHOLE',
      title: 'Valid Complaint Title',
      description: 'Valid complaint description exceeding ten characters.',
      severity: 'MEDIUM',
      latitude: 100.0, // Invalid: > 90
      longitude: 200.0, // Invalid: > 180
      address: 'Some Address',
    };

    const dto = plainToInstance(CreateComplaintDto, rawPayload);
    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    const latError = errors.find((e) => e.property === 'latitude');
    const lngError = errors.find((e) => e.property === 'longitude');

    expect(latError).toBeDefined();
    expect(lngError).toBeDefined();
  });
});
