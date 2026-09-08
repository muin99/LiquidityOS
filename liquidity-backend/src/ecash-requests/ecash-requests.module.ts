import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcashRequest } from './ecash-request.entity';
import { Wallet } from '../wallets/wallet.entity';
import { CashDrawer } from '../wallets/cash-drawer.entity';
import { CashTransaction } from '../wallets/cash-transaction.entity';
import { AgentProvider } from '../agent-providers/agent-provider.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { EcashRequestsService } from './ecash-requests.service';
import { EcashRequestsController } from './ecash-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EcashRequest,
      Wallet,
      CashDrawer,
      CashTransaction,
      AgentProvider,
      CoordinatorProvider,
    ]),
  ],
  controllers: [EcashRequestsController],
  providers: [EcashRequestsService],
})
export class EcashRequestsModule {}
