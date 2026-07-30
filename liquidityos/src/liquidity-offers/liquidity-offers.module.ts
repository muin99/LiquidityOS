import { Module } from '@nestjs/common';
import { LiquidityOffersService } from './liquidity-offers.service';
import { LiquidityOffersController } from './liquidity-offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityOffer } from './entities/liquidity-offer.entity';
import { LiquidityAssignment } from './entities/liquidity-assignment.entity';
import { LiquidityRequest } from '../liquidity-requests/entities/liquidity-request.entity';
import { Agent } from '../agents/entities/agent.entity';
import { LiquidityCoordinator } from '../coordinators/entities/liquidity-coordinator.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiquidityOffer,
      LiquidityAssignment,
      LiquidityRequest,
      Agent,
      LiquidityCoordinator,
      User,
    ]),
  ],
  providers: [LiquidityOffersService],
  controllers: [LiquidityOffersController],
})
export class LiquidityOffersModule {}
