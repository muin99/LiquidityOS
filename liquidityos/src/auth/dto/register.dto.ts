import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,20}$/)
  phone?: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
