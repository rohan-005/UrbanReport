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
    return this.repo.create(dto, reporterUserId);
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
    return this.repo.assignDepartment(complaintId, departmentId, officerId, notes, actorUserId);
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
    return this.repo.updateStatus(
      id,
      current.status,
      dto.nextStatus,
      actorUserId,
      noteText,
      dto.resolutionMediaIds,
    );
  }
}

