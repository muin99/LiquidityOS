import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashDrawer } from './cash-drawer.entity';
import { Wallet } from './wallet.entity';
import { CashTransaction } from './cash-transaction.entity';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CashDrawer, Wallet, CashTransaction])],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
