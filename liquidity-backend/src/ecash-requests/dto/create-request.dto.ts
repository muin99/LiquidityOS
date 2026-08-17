import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateEcashRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
