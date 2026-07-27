import { Module } from '@nestjs/common';
import { LiquidityTransfersService } from './liquidity-transfers.service';
import { LiquidityTransfersController } from './liquidity-transfers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { LiquidityTransfer } from './entities/liquidity-transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, LiquidityTransfer])],
  providers: [LiquidityTransfersService],
  controllers: [LiquidityTransfersController],
})
export class LiquidityTransfersModule {}
