import { IsEnum, IsInt, IsUUID, Max, Min } from 'class-validator';

export class SupplyLiquidityDto {
  @IsUUID()
  fromWalletId: string;

  @IsUUID()
  toWalletId: string;

  @IsInt()
  @Min(1)
  @Max(9007199254740991)
  amount: number;

  @IsEnum(['COORDINATOR_SUPPLY', 'PROVIDER_SUPPLY'])
  transferType: 'COORDINATOR_SUPPLY' | 'PROVIDER_SUPPLY';
}
