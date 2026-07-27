import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { LiquidityCoordinator } from '../coordinators/entities/liquidity-coordinator.entity';
import { LiquidityRequest } from '../liquidity-requests/entities/liquidity-request.entity';
import { LiquidityTransfer } from '../liquidity-transfers/entities/liquidity-transfer.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ProviderListQueryDto } from './dto/provider-list-query.dto';
import { SupplyLiquidityDto } from './dto/supply-liquidity.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CoordinatorProvider } from './entities/coordinator-provider.entity';
import { Provider } from './entities/provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providers: Repository<Provider>,
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
    @InjectRepository(LiquidityCoordinator)
    private readonly coordinators: Repository<LiquidityCoordinator>,
    @InjectRepository(CoordinatorProvider)
    private readonly coordinatorProviders: Repository<CoordinatorProvider>,
    @InjectRepository(LiquidityRequest)
    private readonly requests: Repository<LiquidityRequest>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProviderDto) {
    const provider = this.providers.create({
      name: dto.name,
      tenant_code: dto.tenantCode,
      contact_name: dto.contactName,
      contact_email: dto.contactEmail,
      contact_phone: dto.contactPhone,
    });
    try {
      return await this.providers.save(provider);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException(
          'A provider with this tenant code already exists',
        );
      }
      throw error;
    }
  }

  async findAll(query: ProviderListQueryDto) {
    const builder = this.providers.createQueryBuilder('provider');
    if (query.status)
      builder.andWhere('provider.status = :status', { status: query.status });
    if (query.search) {
      builder.andWhere(
        '(provider.name ILIKE :search OR provider.tenant_code ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }
    const [data, total] = await builder
      .orderBy('provider.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return { data, meta: { page: query.page, limit: query.limit, total } };
  }

  async findOne(id: string) {
    const provider = await this.providers.findOneBy({ id });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    const provider = await this.findOne(id);
    Object.assign(provider, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.tenantCode !== undefined && { tenant_code: dto.tenantCode }),
      ...(dto.contactName !== undefined && { contact_name: dto.contactName }),
      ...(dto.contactEmail !== undefined && {
        contact_email: dto.contactEmail,
      }),
      ...(dto.contactPhone !== undefined && {
        contact_phone: dto.contactPhone,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
    });
    try {
      return await this.providers.save(provider);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException(
          'A provider with this tenant code already exists',
        );
      }
      throw error;
    }
  }

  async approve(id: string, note?: string) {
    const provider = await this.findOne(id);
    provider.status = 'approved';
    provider.onboarding_note = note;
    return this.providers.save(provider);
  }

  async reject(id: string, note?: string) {
    const provider = await this.findOne(id);
    provider.status = 'rejected';
    provider.onboarding_note = note;
    return this.providers.save(provider);
  }

  async remove(id: string) {
    const provider = await this.findOne(id);
    await this.providers.remove(provider);
    return { message: 'Provider deleted' };
  }

  async listAgents(id: string, page = 1, limit = 20) {
    await this.findOne(id);
    const [data, total] = await this.agents.findAndCount({
      where: { providerId: id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async listCoordinators(id: string, status?: CoordinatorProvider['status']) {
    await this.findOne(id);
    const links = await this.coordinatorProviders.find({
      where: { providerId: id, ...(status && { status }) },
      order: { createdAt: 'DESC' },
    });
    const coordinatorIds = links.map((link) => link.coordinatorId);
    const coordinators = coordinatorIds.length
      ? await this.coordinators.findBy({ id: In(coordinatorIds) })
      : [];
    const indexed = new Map(
      coordinators.map((coordinator) => [coordinator.id, coordinator]),
    );
    return links.map((link) => ({
      ...link,
      coordinator: indexed.get(link.coordinatorId),
    }));
  }

  async approveCoordinator(id: string, coordinatorId: string, note?: string) {
    return this.setCoordinatorStatus(id, coordinatorId, 'approved', note);
  }

  async rejectCoordinator(id: string, coordinatorId: string, note?: string) {
    return this.setCoordinatorStatus(id, coordinatorId, 'rejected', note);
  }

  private async setCoordinatorStatus(
    providerId: string,
    coordinatorId: string,
    status: CoordinatorProvider['status'],
    note?: string,
  ) {
    await this.findOne(providerId);
    const link = await this.coordinatorProviders.findOneBy({
      providerId,
      coordinatorId,
    });
    if (!link)
      throw new NotFoundException('Coordinator-provider link not found');
    link.status = status;
    link.note = note;
    link.approvedAt = status === 'approved' ? new Date() : undefined;
    return this.coordinatorProviders.save(link);
  }

  async shortages(id: string, status = 'open') {
    await this.findOne(id);
    return this.requests.find({
      where: { providerId: id, status },
      order: { urgency: 'DESC', createdAt: 'DESC' },
    });
  }

  async dashboard(id: string) {
    await this.findOne(id);
    const [
      openShortages,
      assignedRequests,
      fulfilledRequests,
      activeAgents,
      approvedCoordinators,
    ] = await Promise.all([
      this.requests.countBy({ providerId: id, status: 'open' }),
      this.requests.countBy({ providerId: id, status: 'assigned' }),
      this.requests.countBy({ providerId: id, status: 'fulfilled' }),
      this.agents.countBy({ providerId: id, status: 'active' }),
      this.coordinatorProviders.countBy({ providerId: id, status: 'approved' }),
    ]);
    const completed = fulfilledRequests;
    const totalClosed = completed + assignedRequests;
    return {
      openShortages,
      assignedRequests,
      fulfilledRequests,
      activeAgents,
      approvedCoordinators,
      fillRate: totalClosed ? completed / totalClosed : 0,
    };
  }

  async supply(id: string, dto: SupplyLiquidityDto, idempotencyKey?: string) {
    if (!idempotencyKey)
      throw new BadRequestException('Idempotency-Key header is required');
    if (dto.fromWalletId === dto.toWalletId) {
      throw new BadRequestException(
        'Source and destination wallets cannot be the same',
      );
    }
    await this.findOne(id);

    return this.dataSource.transaction(async (manager) => {
      const transferRepository = manager.getRepository(LiquidityTransfer);
      const existing = await transferRepository.findOneBy({ idempotencyKey });
      if (existing) {
        if (
          existing.fromWalletId !== dto.fromWalletId ||
          existing.toWalletId !== dto.toWalletId ||
          existing.amount !== String(dto.amount) ||
          existing.transferType !== dto.transferType
        ) {
          throw new ConflictException(
            'Idempotency key was already used with a different payload',
          );
        }
        return existing;
      }

      const walletRepository = manager.getRepository(Wallet);
      const source = await walletRepository
        .createQueryBuilder('wallet')
        .setLock('pessimistic_write')
        .where('wallet.id = :id', { id: dto.fromWalletId })
        .getOne();
      const destination = await walletRepository
        .createQueryBuilder('wallet')
        .setLock('pessimistic_write')
        .where('wallet.id = :id', { id: dto.toWalletId })
        .getOne();
      if (!source || !destination)
        throw new NotFoundException('Source or destination wallet not found');
      if (source.providerId !== id)
        throw new BadRequestException(
          'Source wallet is outside this provider scope',
        );
      if (destination.ownerType !== 'coordinator') {
        throw new BadRequestException(
          'Provider liquidity can only be supplied to a coordinator wallet',
        );
      }
      if (source.status !== 'active' || destination.status !== 'active') {
        throw new ConflictException('Frozen wallets cannot transfer liquidity');
      }
      if (source.walletType !== destination.walletType) {
        throw new BadRequestException('Wallet types must match');
      }
      if (BigInt(source.balance) < BigInt(dto.amount)) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      source.balance = (BigInt(source.balance) - BigInt(dto.amount)).toString();
      destination.balance = (
        BigInt(destination.balance) + BigInt(dto.amount)
      ).toString();
      await walletRepository.save([source, destination]);
      return transferRepository.save(
        transferRepository.create({
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
}
