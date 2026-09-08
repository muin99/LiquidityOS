import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyToProviderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerId: string;
}
