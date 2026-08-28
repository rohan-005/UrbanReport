import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Search query must be at least 2 characters long' })
  @MaxLength(100, { message: 'Search query cannot exceed 100 characters' })
  q: string;
}
