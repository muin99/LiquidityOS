import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcashRequest } from './ecash-request.entity';
import { Wallet } from '../wallets/wallet.entity';
import { EcashRequestsService } from './ecash-requests.service';
import { EcashRequestsController } from './ecash-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EcashRequest, Wallet])],
  controllers: [EcashRequestsController],
  providers: [EcashRequestsService],
})
export class EcashRequestsModule {}
