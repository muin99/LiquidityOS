import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/domain.enums';

export class RegisterDto {
  @IsString()
  @Length(2, 120)
  name: string;
  @IsEmail()
  email: string;
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
  @IsString()
  @MinLength(8)
  password: string;
  @IsEnum(UserRole)
  role: UserRole;
  @IsOptional()
  @IsUUID()
  providerId?: string;
  @IsOptional()
  @IsUUID()
  areaId?: string;
}
