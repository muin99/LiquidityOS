import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateLiquidityOfferDto } from './dto/create-liquidity-offer.dto';
import { LiquidityOffer } from './entities/liquidity-offer.entity';
import { UpdateLiquidityOfferDto } from './dto/update-liquidity-offer.dto';
import { AcceptLiquidityOfferDto } from './dto/accept-liquidity-offer.dto';
import { LiquidityAssignment } from './entities/liquidity-assignment.entity';
import { LiquidityRequest } from '../liquidity-requests/entities/liquidity-request.entity';
import { Agent } from '../agents/entities/agent.entity';
import { LiquidityCoordinator } from '../coordinators/entities/liquidity-coordinator.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

interface AssignmentActor {
  id: string;
  role: UserRole;
}

@Injectable()
export class LiquidityOffersService {
  constructor(
    @InjectRepository(LiquidityOffer)
    private readonly offers: Repository<LiquidityOffer>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  create(dto: CreateLiquidityOfferDto) {
    return this.offers.save(
      this.offers.create({
        ...dto,
        availableAmount: String(dto.availableAmount),
      }),
    );
  }
  findAll(requestId?: string, coordinatorId?: string) {
    return this.offers.find({
      where: {
        ...(requestId && { requestId }),
        ...(coordinatorId && { coordinatorId }),
      },
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string) {
    const offer = await this.offers.findOneBy({ id });
    if (!offer) throw new NotFoundException('Liquidity offer not found');
    return offer;
  }
  async update(id: string, dto: UpdateLiquidityOfferDto) {
    const offer = await this.findOne(id);
    if (offer.status !== 'submitted')
      throw new BadRequestException('Only submitted offers can be updated');
    Object.assign(
      offer,
      dto,
      dto.availableAmount && { availableAmount: String(dto.availableAmount) },
    );
    return this.offers.save(offer);
  }
  async withdraw(id: string) {
    const offer = await this.findOne(id);
    if (offer.status !== 'submitted')
      throw new BadRequestException('Only submitted offers can be withdrawn');
    offer.status = 'withdrawn';
    return this.offers.save(offer);
  }

  async accept(
    id: string,
    dto: AcceptLiquidityOfferDto,
    actor: AssignmentActor,
  ): Promise<LiquidityAssignment> {
    return this.dataSource.transaction(async (manager) => {
      const offers = manager.getRepository(LiquidityOffer);
      const requests = manager.getRepository(LiquidityRequest);
      const assignments = manager.getRepository(LiquidityAssignment);

      const offer = await offers
        .createQueryBuilder('offer')
        .setLock('pessimistic_write')
        .where('offer.id = :id', { id })
        .getOne();

      if (!offer) {
        throw new NotFoundException('Liquidity offer not found');
      }

      const request = await requests
        .createQueryBuilder('request')
        .setLock('pessimistic_write')
        .where('request.id = :id', { id: offer.requestId })
        .getOne();

      if (!request) {
        throw new NotFoundException('Liquidity request not found');
      }

      await this.assertActorCanAssign(manager, request, actor);

      if (offer.status !== 'submitted') {
        throw new ConflictException('Only submitted offers can be accepted');
      }
      if (request.status !== 'open') {
        throw new ConflictException('Only open requests can be assigned');
      }
      if (request.expiresAt <= new Date()) {
        throw new ConflictException('Expired requests cannot be assigned');
      }

      const assignedAmount = BigInt(dto.assignedAmount);
      const requestAmount = BigInt(request.amount);
      const offeredAmount = BigInt(offer.availableAmount);

      if (assignedAmount > offeredAmount) {
        throw new BadRequestException(
          'Assigned amount cannot exceed the offered amount',
        );
      }
      if (assignedAmount > requestAmount) {
        throw new BadRequestException(
          'Assigned amount cannot exceed the requested amount',
        );
      }
      if (!request.allowPartial && assignedAmount !== requestAmount) {
        throw new BadRequestException(
          'This request requires the full requested amount',
        );
      }

      const coordinator = await manager
        .getRepository(LiquidityCoordinator)
        .findOneBy({ id: offer.coordinatorId });

      if (!coordinator) {
        throw new NotFoundException('Offer coordinator not found');
      }

      const existingAssignment = await assignments.findOneBy({
        requestId: request.id,
      });
      if (existingAssignment) {
        throw new ConflictException('Request already has an assignment');
      }

      const assignment = await assignments.save(
        assignments.create({
          requestId: request.id,
          offerId: offer.id,
          assignedTo: coordinator.userId,
          assignedBy: actor.id,
          assignedAmount: String(dto.assignedAmount),
          status: 'active',
        }),
      );

      offer.status = 'accepted';
      request.status = 'assigned';
      await offers.save(offer);
      await requests.save(request);

      await offers.update(
        { requestId: request.id, status: 'submitted' },
        { status: 'rejected' },
      );

      return assignment;
    });
  }

  private async assertActorCanAssign(
    manager: EntityManager,
    request: LiquidityRequest,
    actor: AssignmentActor,
  ): Promise<void> {
    if (actor.role === UserRole.ADMIN) {
      return;
    }

    if (actor.role === UserRole.PROVIDER) {
      const user = await manager
        .getRepository(User)
        .findOneBy({ id: actor.id });
      if (user?.providerId === request.providerId) {
        return;
      }
    }

    if (actor.role === UserRole.AGENT && request.requesterType === 'agent') {
      const agent = await manager
        .getRepository(Agent)
        .findOneBy({ userId: actor.id });
      if (agent?.id === request.requesterId) {
        return;
      }
    }

    if (
      actor.role === UserRole.COORDINATOR &&
      request.requesterType === 'coordinator'
    ) {
      const coordinator = await manager
        .getRepository(LiquidityCoordinator)
        .findOneBy({ userId: actor.id });
      if (coordinator?.id === request.requesterId) {
        return;
      }
    }

    throw new ForbiddenException(
      'You are not allowed to assign this liquidity request',
    );
  }

  async remove(id: string) {
    const offer = await this.findOne(id);
    await this.offers.remove(offer);
    return { message: 'Liquidity offer deleted' };
  }
}
