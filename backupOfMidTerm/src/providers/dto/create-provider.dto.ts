import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @Length(2, 150)
  name: string;
  @Matches(/^[A-Z0-9_-]{2,30}$/)
  tenantCode: string;

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
}
