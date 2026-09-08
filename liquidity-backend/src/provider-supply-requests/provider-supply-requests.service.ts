import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderSupplyRequest } from './provider-supply-request.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { RequestStatus } from '../common/enums/request-status.enum';
import { RequestType } from '../common/enums/request-type.enum';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class ProviderSupplyRequestsService {
  constructor(
    @InjectRepository(ProviderSupplyRequest)
    private requestsRepo: Repository<ProviderSupplyRequest>,
    @InjectRepository(CoordinatorProvider)
    private coordinatorProvidersRepo: Repository<CoordinatorProvider>,
    private walletsService: WalletsService,
  ) {}

  async create(
    coordinatorId: string,
    providerId: string,
    type: RequestType,
    amount: number,
  ) {
    const approved = await this.coordinatorProvidersRepo.findOne({
      where: { coordinatorId, providerId, status: ApplicationStatus.APPROVED },
    });
    if (!approved) {
      throw new ForbiddenException('You are not approved to work with this provider');
    }

    return this.requestsRepo.save(
      this.requestsRepo.create({ coordinatorId, providerId, type, amount }),
    );
  }

  mine(coordinatorId: string) {
    return this.requestsRepo.find({
      where: { coordinatorId },
      relations: ['provider'],
      order: { requestedAt: 'DESC' },
    });
  }

  pending(providerId: string) {
    return this.requestsRepo.find({
      where: { providerId, status: RequestStatus.PENDING },
      relations: ['coordinator'],
      order: { requestedAt: 'ASC' },
    });
  }

  async fulfill(id: string, providerId: string) {
    const request = await this.requestsRepo.findOne({ where: { id } });
    if (!request || request.providerId !== providerId) {
      throw new NotFoundException('Supply request not found');
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('This supply request is not pending');
    }

    await this.walletsService.supplyCoordinator(
      providerId,
      request.coordinatorId,
      request.type,
      Number(request.amount),
    );
    request.status = RequestStatus.FULFILLED;
    request.fulfilledAt = new Date();
    return this.requestsRepo.save(request);
  }

  async reject(id: string, providerId: string) {
    const request = await this.requestsRepo.findOne({ where: { id } });
    if (!request || request.providerId !== providerId) {
      throw new NotFoundException('Supply request not found');
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('This supply request is not pending');
    }

    request.status = RequestStatus.REJECTED;
    return this.requestsRepo.save(request);
  }
}
