import { describe, it, expect, beforeEach } from 'vitest';
import { complaintRepository } from '../lib/repositories/complaint.repository';

describe('Complaint Repository Tests', () => {
  it('should return initial dataset of 20+ civic complaints', async () => {
    const complaints = await complaintRepository.getAllComplaints();
    expect(complaints.length).toBeGreaterThanOrEqual(20);
  });

  it('should filter complaints by category', async () => {
    const potholeComplaints = await complaintRepository.getAllComplaints({ category: 'Pothole' });
    expect(potholeComplaints.length).toBeGreaterThan(0);
    potholeComplaints.forEach((c) => expect(c.category).toBe('Pothole'));
  });

  it('should filter complaints by severity', async () => {
    const criticalComplaints = await complaintRepository.getAllComplaints({ severity: 'CRITICAL' });
    expect(criticalComplaints.length).toBeGreaterThan(0);
    criticalComplaints.forEach((c) => expect(c.severity).toBe('CRITICAL'));
  });

  it('should create new complaint and append timeline event', async () => {
    const initialCount = (await complaintRepository.getAllComplaints()).length;

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

    expect(newReport.id).toMatch(/^URB-2026-\d{4}$/);
    expect(newReport.timeline.length).toBe(1);
    expect(newReport.timeline[0].status).toBe('SUBMITTED');

    const updatedList = await complaintRepository.getAllComplaints();
    expect(updatedList.length).toBe(initialCount + 1);
  });

  it('should update complaint status and record transition timeline event', async () => {
    const complaints = await complaintRepository.getAllComplaints();
    const target = complaints[0];

    const updated = await complaintRepository.updateStatus(
      target.id,
      'IN_PROGRESS',
      'Eng. Rajesh Kumar',
      'OFFICER',
      'Crew deployed to site'
    );

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('IN_PROGRESS');
    expect(updated?.timeline[0].status).toBe('IN_PROGRESS');
    expect(updated?.timeline[0].actor.name).toBe('Eng. Rajesh Kumar');
  });
});
