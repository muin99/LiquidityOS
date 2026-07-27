import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateLiquidityTransferDto } from './dto/create-liquidity-transfer.dto';
import { LiquidityTransfer } from './entities/liquidity-transfer.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
@Injectable()
export class LiquidityTransfersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async create(dto: CreateLiquidityTransferDto, idempotencyKey?: string) {
    if (!idempotencyKey)
      throw new BadRequestException('Idempotency-Key header is required');
    if (dto.fromWalletId === dto.toWalletId)
      throw new BadRequestException(
        'Source and destination wallets cannot be the same',
      );
    return this.dataSource.transaction(async (manager) => {
      const transfers = manager.getRepository(LiquidityTransfer);
      const old = await transfers.findOneBy({ idempotencyKey });
      if (old) return old;
      const wallets = manager.getRepository(Wallet);
      const source = await wallets.findOneBy({ id: dto.fromWalletId });
      const destination = await wallets.findOneBy({ id: dto.toWalletId });
      if (!source || !destination)
        throw new NotFoundException('Source or destination wallet not found');
      if (source.status !== 'active' || destination.status !== 'active')
        throw new ConflictException('Frozen wallets cannot transfer');
      if (source.walletType !== destination.walletType)
        throw new BadRequestException('Wallet types must match');
      if (source.ownerType === 'agent' && destination.ownerType === 'agent')
        throw new BadRequestException(
          'Agent-to-agent transfers are not allowed',
        );
      if (BigInt(source.balance) < BigInt(dto.amount))
        throw new BadRequestException('Insufficient wallet balance');
      source.balance = (BigInt(source.balance) - BigInt(dto.amount)).toString();
      destination.balance = (
        BigInt(destination.balance) + BigInt(dto.amount)
      ).toString();
      await wallets.save([source, destination]);
      return transfers.save(
        transfers.create({
          fromWalletId: source.id,
          toWalletId: destination.id,
          amount: String(dto.amount),
          transferType: dto.transferType,
          idempotencyKey,
          status: 'success',
          completedAt: new Date(),
        }),
      );
    });
  }
  async findOne(id: string) {
    const transfer = await this.dataSource
      .getRepository(LiquidityTransfer)
      .findOneBy({ id });
    if (!transfer) throw new NotFoundException('Transfer not found');
    return transfer;
  }
  findAll() {
    return this.dataSource
      .getRepository(LiquidityTransfer)
      .find({ order: { createdAt: 'DESC' } });
  }
}
