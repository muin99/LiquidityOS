import { Module } from '@nestjs/common';
import { LiquidityTransfersService } from './liquidity-transfers.service';
import { LiquidityTransfersController } from './liquidity-transfers.controller';

@Module({
  providers: [LiquidityTransfersService],
  controllers: [LiquidityTransfersController],
})
export class LiquidityTransfersModule {}
