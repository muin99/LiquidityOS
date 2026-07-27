import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLiquidityTransferDto } from './dto/create-liquidity-transfer.dto';

@Injectable()
export class LiquidityTransfersService {
  checkTransfer(createLiquidityTransferDto: CreateLiquidityTransferDto) {
    if (
      createLiquidityTransferDto.fromWalletId ===
      createLiquidityTransferDto.toWalletId
    ) {
      throw new BadRequestException(
        'Source and destination wallets cannot be the same',
      );
    }

    return {
      message: 'Transfer data is valid',
      data: createLiquidityTransferDto,
    };
  }
}
