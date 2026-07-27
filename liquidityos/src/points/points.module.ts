import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointTransaction])],
  providers: [PointsService],
  controllers: [PointsController],
})
export class PointsModule {}
