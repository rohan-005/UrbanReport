import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  nextStatus: string;

  @IsOptional()
  @IsString()
  note?: string;
}
