import { Module } from '@nestjs/common';
import { LiquidityRequestsService } from './liquidity-requests.service';
import { LiquidityRequestsController } from './liquidity-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityRequest } from './entities/liquidity-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiquidityRequest])],
  providers: [LiquidityRequestsService],
  controllers: [LiquidityRequestsController],
})
export class LiquidityRequestsModule {}
