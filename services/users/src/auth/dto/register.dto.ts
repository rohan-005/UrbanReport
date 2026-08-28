import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}\s?\d{4}\s?\d{4}$/, {
    message: 'Aadhaar must be a 12-digit numeric identifier (Format: XXXX XXXX XXXX)',
  })
  aadhaar: string;
}
