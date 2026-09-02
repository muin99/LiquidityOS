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

  // Nobody can sign themselves up as admin — an admin has to be made by hand.
  @ApiProperty({
    enum: [UserRole.AGENT, UserRole.COORDINATOR, UserRole.PROVIDER],
  })
  @IsEnum([UserRole.AGENT, UserRole.COORDINATOR, UserRole.PROVIDER])
  role: UserRole.AGENT | UserRole.COORDINATOR | UserRole.PROVIDER;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  areaId?: string;

  // Required when role is "provider" — which provider this account
  // is allowed to manage. Ignored for every other role.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  providerId?: string;
}
