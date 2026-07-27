import { Module } from '@nestjs/common';
import { LiquidityOffersService } from './liquidity-offers.service';
import { LiquidityOffersController } from './liquidity-offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityOffer } from './entities/liquidity-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiquidityOffer])],
  providers: [LiquidityOffersService],
  controllers: [LiquidityOffersController],
})
export class LiquidityOffersModule {}
