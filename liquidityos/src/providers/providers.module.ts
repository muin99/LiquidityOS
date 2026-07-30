import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { LiquidityCoordinator } from '../coordinators/entities/liquidity-coordinator.entity';
import { LiquidityRequest } from '../liquidity-requests/entities/liquidity-request.entity';
import { LiquidityTransfer } from '../liquidity-transfers/entities/liquidity-transfer.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { CoordinatorProvider } from './entities/coordinator-provider.entity';
import { Provider } from './entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      Agent,
      LiquidityCoordinator,
      CoordinatorProvider,
      LiquidityRequest,
      Wallet,
      LiquidityTransfer,
    ]),
  ],
  providers: [ProvidersService],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModule {}
