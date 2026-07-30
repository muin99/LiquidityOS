import { Module } from '@nestjs/common';
import { BalanceSnapshotsService } from './balance-snapshots.service';
import { BalanceSnapshotsController } from './balance-snapshots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceSnapshot } from './entities/balance-snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceSnapshot])],
  controllers: [BalanceSnapshotsController],
  providers: [BalanceSnapshotsService],
})
export class BalanceSnapshotsModule {}
