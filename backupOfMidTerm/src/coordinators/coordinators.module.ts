import { Module } from '@nestjs/common';
import { CoordinatorsService } from './coordinators.service';
import { CoordinatorsController } from './coordinators.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityCoordinator } from './entities/liquidity-coordinator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiquidityCoordinator])],
  providers: [CoordinatorsService],
  controllers: [CoordinatorsController],
})
export class CoordinatorsModule {}
