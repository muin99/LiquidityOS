import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderSupplyRequest } from './provider-supply-request.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { ProviderSupplyRequestsService } from './provider-supply-requests.service';
import { ProviderSupplyRequestsController } from './provider-supply-requests.controller';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    WalletsModule,
    TypeOrmModule.forFeature([ProviderSupplyRequest, CoordinatorProvider]),
  ],
  controllers: [ProviderSupplyRequestsController],
  providers: [ProviderSupplyRequestsService],
})
export class ProviderSupplyRequestsModule {}
