import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @Matches(/^[A-Z0-9_-]{2,20}$/)
  code: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
