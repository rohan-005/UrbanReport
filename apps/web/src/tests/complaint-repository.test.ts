import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { complaintRepository } from '../lib/repositories/complaint.repository';

describe('ApiComplaintRepositoryImpl Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should fetch and map list of complaints from Gateway', async () => {
    const mockResponse = {
      items: [
        {
          id: 'URB-1001',
          category: 'POTHOLE',
          title: 'Pothole on Ring Road',
          description: 'Deep dangerous pothole near junction.',
          severity: 'HIGH',
          status: 'SUBMITTED',
          latitude: '12.9172',
          longitude: '77.6228',
          address: 'Outer Ring Road, Bengaluru',
          created_at: '2026-08-29T10:00:00.000Z',
          updated_at: '2026-08-29T10:00:00.000Z',
          upvotes_count: 5,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const complaints = await complaintRepository.getAllComplaints({ category: 'Pothole' });
    expect(complaints.length).toBe(1);
    expect(complaints[0].id).toBe('URB-1001');
    expect(complaints[0].category).toBe('Pothole');
    expect(complaints[0].severity).toBe('HIGH');
    expect(complaints[0].latitude).toBe(12.9172);
    expect(complaints[0].longitude).toBe(77.6228);
  });

  it('should post formatted complaint payload to POST /api/complaints', async () => {
    let capturedUrl = '';
    let capturedOptions: any = null;

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string, options: any) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        json: async () => ({
          id: 'URB-2026-9999',
          category: 'TRAFFIC',
          title: 'Broken Traffic Light Signal',
          description: 'Traffic signal light broken at major crossing causing gridlock.',
          severity: 'HIGH',
          status: 'SUBMITTED',
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'MG Road Junction, Bengaluru',
          created_at: '2026-08-29T10:00:00.000Z',
          updated_at: '2026-08-29T10:00:00.000Z',
        }),
      };
    }));

    const newReport = await complaintRepository.createComplaint({
      title: 'Broken Traffic Light Signal',
      category: 'Traffic',
      description: 'Traffic signal light broken at major crossing causing gridlock.',
      severity: 'HIGH',
      status: 'SUBMITTED',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'MG Road Junction, Bengaluru',
      reporter: { id: 'user-001', name: 'Test Reporter' },
      media: [],
    });

    expect(capturedUrl).toContain('/api/complaints');
    expect(capturedOptions.method).toBe('POST');

    const parsedBody = JSON.parse(capturedOptions.body);
    expect(parsedBody.category).toBe('TRAFFIC');
    expect(parsedBody.title).toBe('Broken Traffic Light Signal');
    expect(parsedBody.description).toBe('Traffic signal light broken at major crossing causing gridlock.');
    expect(parsedBody.severity).toBe('HIGH');
    expect(parsedBody.latitude).toBe(12.9716);
    expect(parsedBody.longitude).toBe(77.5946);
    expect(parsedBody.address).toBe('MG Road Junction, Bengaluru');

    expect(newReport.id).toBe('URB-2026-9999');
    expect(newReport.category).toBe('Traffic');
  });

  it('should throw meaningful error message when API returns 400 Bad Request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: [
          'Title must be at least 5 characters long',
          'Description must be at least 10 characters long',
        ],
        error: 'Bad Request',
      }),
    }));

    await expect(
      complaintRepository.createComplaint({
        title: 'Bad',
        category: 'Pothole',
        description: 'Short',
        severity: 'LOW',
        status: 'SUBMITTED',
        latitude: 12.9172,
        longitude: 77.6228,
        address: 'Test Address',
        reporter: { id: 'user-001', name: 'Test Reporter' },
        media: [],
      })
    ).rejects.toThrow('Title must be at least 5 characters long | Description must be at least 10 characters long');
  });
});
