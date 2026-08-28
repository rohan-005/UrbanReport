import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '../types/complaint.types';

export class UpdateStatusDto {
  @IsEnum(
    [
      'SUBMITTED',
      'UNDER_REVIEW',
      'VERIFIED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REOPENED',
      'REJECTED',
    ],
    { message: 'Invalid complaint status' },
  )
  @IsNotEmpty()
  nextStatus: ComplaintStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
