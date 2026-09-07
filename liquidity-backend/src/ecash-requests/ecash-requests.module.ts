import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcashRequest } from './ecash-request.entity';
import { Wallet } from '../wallets/wallet.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { EcashRequestsService } from './ecash-requests.service';
import { EcashRequestsController } from './ecash-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EcashRequest, Wallet, CoordinatorProvider]),
  ],
  controllers: [EcashRequestsController],
  providers: [EcashRequestsService],
})
export class EcashRequestsModule {}
