import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBalanceSnapshotDto } from './dto/create-balance-snapshot.dto';
import { UpdateBalanceSnapshotDto } from './dto/update-balance-snapshot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BalanceSnapshot } from './entities/balance-snapshot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BalanceSnapshotsService {

  constructor(
    @InjectRepository(BalanceSnapshot)
    private readonly snapshotsRepository: Repository<BalanceSnapshot>
  ) { }
  async create(createBalanceSnapshotDto: CreateBalanceSnapshotDto): Promise<BalanceSnapshot> {
    const snapshot = this.snapshotsRepository.create({
      agentId: createBalanceSnapshotDto.agentId,
      cashBalance: String(createBalanceSnapshotDto.cashBalance),
      eMoneyBalance: String(createBalanceSnapshotDto.eMoneyBalance),
      recordedAt: new Date(createBalanceSnapshotDto.recordedAt),
    });

    return await this.snapshotsRepository.save(snapshot);
  }

  findAll() {
    return `This action returns all balanceSnapshots`;
  }

  async findOne(id: string): Promise<BalanceSnapshot> {
    const snapshot = await this.snapshotsRepository.findOneBy({ id });
    if (!snapshot) {
      throw new NotFoundException("Balance snapshot not found");

    }
    return snapshot;
  }

  async update(
    id: string,
    updateBalanceSnapshotDto: UpdateBalanceSnapshotDto,
  ): Promise<BalanceSnapshot> {
    const snapshot = await this.findOne(id);

    if (updateBalanceSnapshotDto.agentId !== undefined) {
      snapshot.agentId = updateBalanceSnapshotDto.agentId;
    }

    if (updateBalanceSnapshotDto.cashBalance !== undefined) {
      snapshot.cashBalance = String(
        updateBalanceSnapshotDto.cashBalance,
      );
    }

    if (updateBalanceSnapshotDto.eMoneyBalance !== undefined) {
      snapshot.eMoneyBalance = String(
        updateBalanceSnapshotDto.eMoneyBalance,
      );
    }

    if (updateBalanceSnapshotDto.recordedAt !== undefined) {
      snapshot.recordedAt = new Date(
        updateBalanceSnapshotDto.recordedAt,
      );
    }

    return await this.snapshotsRepository.save(snapshot);
  }

  async remove(id: string): Promise<{message: string}> {
    const snapshot = await this.findOne(id);
    await this.snapshotsRepository.remove(snapshot);

    return {
      message: "Deleted successful"
    }
  }

}
