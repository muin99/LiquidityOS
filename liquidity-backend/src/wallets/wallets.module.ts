import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashDrawer } from './cash-drawer.entity';
import { Wallet } from './wallet.entity';
import { CashTransaction } from './cash-transaction.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { AgentProvider } from '../agent-providers/agent-provider.entity';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashDrawer,
      Wallet,
      CashTransaction,
      CoordinatorProvider,
      AgentProvider,
    ]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
