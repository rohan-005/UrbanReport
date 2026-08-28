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

  async updateStatus(id: string, dto: UpdateStatusDto, actorUserId: string) {
    const current = await this.getComplaintById(id);
    this.lifecycle.validateTransition(current.status, dto.nextStatus);
    return this.repo.updateStatus(id, current.status, dto.nextStatus, actorUserId, dto.note);
  }
}
