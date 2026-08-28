import { IsNotEmpty, IsString } from 'class-validator';

export class AssociateMediaDto {
  @IsString()
  @IsNotEmpty()
  complaintId: string;
}
