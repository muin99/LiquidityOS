import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  // Only "agent" or "coordinator" can self-register.
  // Nobody can sign themselves up as admin — an admin has to be made by hand.
  @ApiProperty({ enum: [UserRole.AGENT, UserRole.COORDINATOR] })
  @IsEnum([UserRole.AGENT, UserRole.COORDINATOR])
  role: UserRole.AGENT | UserRole.COORDINATOR;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  areaId?: string;
}
