import { IsInt, Min } from 'class-validator';

export class FundWalletDto {
  @IsInt()
  @Min(1)
  amount: number;
}
