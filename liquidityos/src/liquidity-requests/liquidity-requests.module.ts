import { Module } from '@nestjs/common';
import { LiquidityRequestsService } from './liquidity-requests.service';
import { LiquidityRequestsController } from './liquidity-requests.controller';

@Module({
  providers: [LiquidityRequestsService],
  controllers: [LiquidityRequestsController],
})
export class LiquidityRequestsModule {}
