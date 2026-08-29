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
import { Type, Transform } from 'class-transformer';

export class CreateComplaintDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\s+/g, '_').toUpperCase()
      : value,
  )
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
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'title should not be empty' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'description should not be empty' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Invalid severity choice',
  })
  severity: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'latitude must be a number conforming to the specified constraints' })
  @Min(-90, { message: 'latitude must not be less than -90' })
  @Max(90, { message: 'latitude must not be greater than 90' })
  latitude: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'longitude must be a number conforming to the specified constraints' })
  @Min(-180, { message: 'longitude must not be less than -180' })
  @Max(180, { message: 'longitude must not be greater than 180' })
  longitude: number;

  @IsString()
  @IsNotEmpty({ message: 'address should not be empty' })
  address: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaIds?: string[];

  @IsArray()
  @IsOptional()
  media?: any[];

  @IsOptional()
  status?: any;

  @IsOptional()
  reporter?: any;

  @IsOptional()
  id?: any;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;
}
