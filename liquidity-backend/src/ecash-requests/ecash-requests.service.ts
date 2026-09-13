import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { EcashRequest } from './ecash-request.entity';
import { Wallet } from '../wallets/wallet.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';

@Injectable()
export class EcashRequestsService {
  constructor(
    @InjectRepository(EcashRequest)
    private requestsRepo: Repository<EcashRequest>,
    @InjectRepository(CoordinatorProvider)
    private coordinatorProvidersRepo: Repository<CoordinatorProvider>,
    private dataSource: DataSource,
  ) {}

  // Step 1: an agent whose wallet is running low asks for a top-up.
  create(agentId: string, providerId: string, amount: number) {
    const request = this.requestsRepo.create({
      agentId,
      providerId,
      amount,
      status: RequestStatus.PENDING,
    });
    return this.requestsRepo.save(request);
  }

  // An agent checking on their own past requests.
  myRequests(agentId: string) {
    return this.requestsRepo.find({
      where: { agentId },
      relations: ['provider'],
      order: { requestedAt: 'DESC' },
    });
  }

  // A coordinator only gets to see requests for providers they have
  // actually been approved for — not every single request on the
  // whole platform.
  async pendingRequests(coordinatorId: string) {
    const approvedProviderIds = await this.approvedProviderIdsFor(coordinatorId);
    if (approvedProviderIds.length === 0) {
      return [];
    }

    return this.requestsRepo.find({
      where: { status: RequestStatus.PENDING, providerId: In(approvedProviderIds) },
      relations: ['agent', 'provider'],
      order: { requestedAt: 'ASC' },
    });
  }

  // Step 2: a coordinator says "I'll take care of this one".
  async accept(id: string, coordinatorId: string) {
    const request = await this.requestsRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('This request is not pending anymore');
    }

    // You can only accept requests for a provider you've actually
    // been approved to work with — otherwise anyone could grab any
    // agent's request for any provider.
    const approvedProviderIds = await this.approvedProviderIdsFor(coordinatorId);
    if (!approvedProviderIds.includes(request.providerId)) {
      throw new ForbiddenException(
        'You are not an approved coordinator for this provider',
      );
    }

    request.coordinatorId = coordinatorId;
    request.status = RequestStatus.ACCEPTED;
    return this.requestsRepo.save(request);
  }

  // Small helper: which providers is this coordinator approved for?
  private async approvedProviderIdsFor(coordinatorId: string) {
    const approved = await this.coordinatorProvidersRepo.find({
      where: { coordinatorId, status: ApplicationStatus.APPROVED },
    });
    return approved.map((row) => row.providerId);
  }

  // Step 3: the coordinator actually sends the e-cash. This changes real
  // money (the agent's wallet balance), so — same as cash-in/cash-out —
  // we put it in a transaction "magic box": either the wallet top-up AND
  // the request being marked "fulfilled" both happen, or neither does.
  async fulfill(id: string, coordinatorId: string) {
    return this.dataSource.transaction(async (safe) => {
      const request = await safe.findOne(EcashRequest, { where: { id } });
      if (!request) throw new NotFoundException('Request not found');

      if (request.coordinatorId !== coordinatorId) {
        throw new BadRequestException('You have not accepted this request');
      }
      if (request.status !== RequestStatus.ACCEPTED) {
        throw new BadRequestException('This request must be accepted first');
      }

      // find (or make) the agent's e-cash wallet for this provider
      let wallet = await safe.findOne(Wallet, {
        where: { agentId: request.agentId, providerId: request.providerId },
      });
      if (!wallet) {
        wallet = safe.create(Wallet, {
          agentId: request.agentId,
          providerId: request.providerId,
          balance: 0,
        });
      }

      // top up the wallet by the requested amount
      wallet.balance = Number(wallet.balance) + Number(request.amount);
      await safe.save(wallet);

      // mark the request as done
      request.status = RequestStatus.FULFILLED;
      request.fulfilledAt = new Date();
      await safe.save(request);

      return { request, wallet };
    });
  }
}
