import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  complaintUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  resolutionNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  assignmentUpdates?: boolean;
}
