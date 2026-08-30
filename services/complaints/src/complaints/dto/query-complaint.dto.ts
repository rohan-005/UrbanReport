import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Category, Severity, ComplaintStatus } from '../types/complaint.types';

export class ComplaintQueryDto {
  @IsOptional()
  @IsEnum([
    'POTHOLE',
    'GARBAGE',
    'STREETLIGHT',
    'DRAINAGE',
    'ROAD_DAMAGE',
    'WATER_SUPPLY',
    'TRAFFIC',
    'OTHER',
    'ALL',
  ])
  category?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'ALL'])
  severity?: string;

  @IsOptional()
  @IsEnum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'REOPENED',
    'REJECTED',
    'ALL',
  ])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'oldest' | 'upvotes' | 'severity';

  @IsOptional()
  @IsString()
  includeRejected?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
