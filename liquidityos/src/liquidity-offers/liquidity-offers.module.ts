import { Module } from '@nestjs/common';
import { LiquidityOffersService } from './liquidity-offers.service';
import { LiquidityOffersController } from './liquidity-offers.controller';

@Module({
  providers: [LiquidityOffersService],
  controllers: [LiquidityOffersController],
})
export class LiquidityOffersModule {}
