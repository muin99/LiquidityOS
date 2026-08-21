import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProviderListQueryDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'suspended'])
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit = 20;
}
