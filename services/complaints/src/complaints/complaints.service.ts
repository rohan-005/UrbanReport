import { Injectable, NotFoundException } from '@nestjs/common';
import { ComplaintsRepository } from './complaints.repository';
import { ComplaintLifecycleService } from './complaint-lifecycle.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ComplaintQueryDto } from './dto/query-complaint.dto';
import { NearbyQueryDto, ViewportQueryDto } from './dto/geo-query.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly repo: ComplaintsRepository,
    private readonly lifecycle: ComplaintLifecycleService,
  ) {}

  async createComplaint(dto: CreateComplaintDto, reporterUserId: string) {
    const created = await this.repo.create(dto, reporterUserId);
    this.publishNotificationEvent('ComplaintCreated', created, reporterUserId);
    return created;
  }

  async getComplaintById(id: string) {
    const complaint = await this.repo.findById(id);
    if (!complaint) {
      throw new NotFoundException(`Complaint ID ${id} not found.`);
    }
    return complaint;
  }

  async listComplaints(query: ComplaintQueryDto) {
    return this.repo.findMany(query);
  }

  async getMyComplaints(reporterUserId: string) {
    return this.repo.findByReporter(reporterUserId);
  }

  async getNearbyComplaints(dto: NearbyQueryDto) {
    return this.repo.findNearby(dto);
  }

  async getViewportComplaints(dto: ViewportQueryDto) {
    return this.repo.findViewport(dto);
  }

  async getStats() {
    return this.repo.getStats();
  }

  async getDepartments() {
    return this.repo.getDepartments();
  }

  async assignDepartment(
    complaintId: string,
    departmentId: string,
    officerId?: string,
    notes?: string,
    actorUserId: string = 'admin-001',
  ) {
    const updated = await this.repo.assignDepartment(complaintId, departmentId, officerId, notes, actorUserId);
    this.publishNotificationEvent('ComplaintAssigned', updated || { id: complaintId }, actorUserId, notes);
    return updated;
  }

  async addResolutionEvidence(complaintId: string, mediaId: string, actorUserId: string = 'admin-001') {
    return this.repo.addResolutionEvidence(complaintId, mediaId, actorUserId);
  }

  async getAuditEvents(complaintId: string) {
    return this.repo.getAuditEvents(complaintId);
  }

  async findDuplicateCandidates(input: any) {
    return this.repo.findDuplicateCandidates(input);
  }

  async confirmComplaint(complaintId: string, userId: string) {
    return this.repo.confirmComplaint(complaintId, userId);
  }

  async getConfirmationCount(complaintId: string) {
    return this.repo.getConfirmationCount(complaintId);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, actorUserId: string) {
    const current = await this.getComplaintById(id);
    this.lifecycle.validateTransition(current.status, dto.nextStatus);
    const noteText = dto.note || dto.rejectionReason;
    const updated = await this.repo.updateStatus(
      id,
      current.status,
      dto.nextStatus,
      actorUserId,
      noteText,
      dto.resolutionMediaIds,
    );

    const eventTypeMap: Record<string, string> = {
      UNDER_REVIEW: 'ComplaintUnderReview',
      VERIFIED: 'ComplaintVerified',
      REJECTED: 'ComplaintRejected',
      ASSIGNED: 'ComplaintAssigned',
      IN_PROGRESS: 'ComplaintInProgress',
      RESOLVED: 'ComplaintResolved',
      REOPENED: 'ComplaintReopened',
    };

    const eventName = eventTypeMap[dto.nextStatus] || 'ComplaintUpdated';
    this.publishNotificationEvent(eventName, updated || current, actorUserId, noteText);
    return updated;
  }

  private async publishNotificationEvent(eventType: string, complaint: any, actorUserId?: string, notes?: string) {
    const notificationsUrl = process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:5005';
    const eventPayload = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      occurredAt: new Date().toISOString(),
      complaintId: complaint.id,
      reporterUserId: complaint.reporter_user_id || complaint.reporter?.id || 'citizen-anon-001',
      actorUserId,
      metadata: {
        title: complaint.title,
        category: complaint.category,
        status: complaint.status || eventType.replace('Complaint', '').toUpperCase(),
        address: complaint.address,
        notes,
        rejectionReason: notes,
      },
    };

    // Non-blocking fire-and-forget async call
    fetch(`${notificationsUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    }).catch(() => {
      // Intentionally swallow errors so API response speed is unaffected
    });
  }
}

