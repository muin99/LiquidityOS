import { IsOptional, IsString, Length } from 'class-validator';

export class ProviderActionDto {
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  approvalNote?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  rejectionReason?: string;
}
