import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  name?: string;

  @IsOptional()
  @Matches(/^[A-Z0-9_-]{2,30}$/)
  tenantCode?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,20}$/)
  contactPhone?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'suspended'])
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}
