import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

// Used for BOTH cash-in and cash-out — same shape, different endpoint.
export class CashMoveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
