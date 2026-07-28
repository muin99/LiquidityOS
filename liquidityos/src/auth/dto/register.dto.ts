import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';

import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,20}$/)
  phone?: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.PROVIDER)
  @IsString()
  @IsNotEmpty()
  providerName?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.PROVIDER)
  @Matches(/^[A-Z0-9_-]{2,30}$/)
  tenantCode?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,20}$/)
  contactPhone?: string;
}
