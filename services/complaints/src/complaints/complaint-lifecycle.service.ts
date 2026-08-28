import { Injectable, BadRequestException } from '@nestjs/common';
import { ComplaintStatus } from './types/complaint.types';

@Injectable()
export class ComplaintLifecycleService {
  private readonly allowedTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
    SUBMITTED: ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
    UNDER_REVIEW: ['VERIFIED', 'REJECTED'],
    VERIFIED: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
    ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REOPENED'],
    RESOLVED: ['REOPENED'],
    REOPENED: ['UNDER_REVIEW', 'VERIFIED', 'IN_PROGRESS', 'REJECTED'],
    REJECTED: ['REOPENED'],
  };

  validateTransition(fromStatus: ComplaintStatus, toStatus: ComplaintStatus): void {
    if (fromStatus === toStatus) {
      throw new BadRequestException(`Complaint is already in state '${fromStatus}'.`);
    }

    const validNextStates = this.allowedTransitions[fromStatus] || [];
    if (!validNextStates.includes(toStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${fromStatus}' to '${toStatus}'. Allowed transitions: ${validNextStates.join(', ')}`,
      );
    }
  }
}
