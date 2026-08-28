import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class ReverseQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  lng: number;
}
