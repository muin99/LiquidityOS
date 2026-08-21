import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { TransferType } from '../../common/enums/domain.enums';

export class CreateLiquidityTransferDto {
  @IsUUID()
  fromWalletId: string;
  @IsUUID()
  toWalletId: string;
  @IsInt()
  @Min(1)
  amount: number;
  @IsEnum(TransferType)
  transferType: TransferType;
  @IsOptional()
  @IsUUID()
  requestId?: string;
  @IsOptional()
  @IsUUID()
  assignmentId?: string;
}
