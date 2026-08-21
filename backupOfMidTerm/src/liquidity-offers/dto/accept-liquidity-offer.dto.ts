import { IsInt, Min } from 'class-validator';

export class AcceptLiquidityOfferDto {
  @IsInt()
  @Min(1)
  assignedAmount: number;
}
