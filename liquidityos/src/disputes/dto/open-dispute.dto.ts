import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class OpenDisputeDto {
  @IsOptional()
  @IsUUID()
  requestId?: string;
  @IsOptional()
  @IsUUID()
  transferId?: string;
  @IsString()
  @Length(10, 2000)
  reason: string;
}
