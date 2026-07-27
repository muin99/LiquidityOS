import { IsEnum, IsUUID } from 'class-validator';
import { LiquidityType, OwnerType } from '../../common/enums/domain.enums';

export class CreateWalletDto {
  @IsUUID()
  ownerId: string;
  @IsEnum(OwnerType)
  ownerType: OwnerType;
  @IsUUID()
  providerId: string;
  @IsEnum(LiquidityType)
  walletType: LiquidityType;
}
