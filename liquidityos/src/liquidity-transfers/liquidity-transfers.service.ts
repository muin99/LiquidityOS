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
import { LiquidityAssignment } from '../liquidity-offers/entities/liquidity-assignment.entity';
import { LiquidityRequest } from '../liquidity-requests/entities/liquidity-request.entity';
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
      if (old) {
        if (
          old.fromWalletId !== dto.fromWalletId ||
          old.toWalletId !== dto.toWalletId ||
          old.amount !== String(dto.amount) ||
          old.transferType !== dto.transferType
        ) {
          throw new ConflictException(
            'Idempotency key was already used with a different payload',
          );
        }
        return old;
      }
      const wallets = manager.getRepository(Wallet);
      let assignment: LiquidityAssignment | null = null;

      if (dto.assignmentId) {
        assignment = await manager
          .getRepository(LiquidityAssignment)
          .findOneBy({ id: dto.assignmentId });

        if (!assignment) {
          throw new NotFoundException('Liquidity assignment not found');
        }
        if (assignment.status !== 'active') {
          throw new ConflictException('Liquidity assignment is not active');
        }
        if (assignment.assignedAmount !== String(dto.amount)) {
          throw new BadRequestException(
            'Transfer amount must match the assigned amount',
          );
        }
        if (dto.requestId && dto.requestId !== assignment.requestId) {
          throw new BadRequestException(
            'Transfer request does not match the assignment',
          );
        }
      }

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
      const transfer = await transfers.save(
        transfers.create({
          fromWalletId: source.id,
          toWalletId: destination.id,
          assignmentId: dto.assignmentId,
          requestId: dto.requestId ?? assignment?.requestId,
          amount: String(dto.amount),
          transferType: dto.transferType,
          idempotencyKey,
          status: 'success',
          completedAt: new Date(),
        }),
      );

      if (assignment) {
        assignment.status = 'completed';
        await manager.getRepository(LiquidityAssignment).save(assignment);

        const request = await manager
          .getRepository(LiquidityRequest)
          .findOneBy({ id: assignment.requestId });
        if (!request) {
          throw new NotFoundException('Assigned liquidity request not found');
        }
        request.status = 'fulfilled';
        await manager.getRepository(LiquidityRequest).save(request);
      }

      return transfer;
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
