import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Category, Severity } from '../types/complaint.types';

export class CreateComplaintDto {
  @IsEnum(
    [
      'POTHOLE',
      'GARBAGE',
      'STREETLIGHT',
      'DRAINAGE',
      'ROAD_DAMAGE',
      'WATER_SUPPLY',
      'TRAFFIC',
      'OTHER',
    ],
    { message: 'Invalid category choice' },
  )
  category: Category;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Invalid severity choice',
  })
  severity: Severity;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaIds?: string[];
}
