import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLiquidityOfferDto {
  @IsUUID()
  requestId: string;
  @IsUUID()
  coordinatorId: string;
  @IsInt()
  @Min(1)
  availableAmount: number;
  @IsInt()
  @Min(1)
  etaMinutes: number;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
