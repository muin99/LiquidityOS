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
import { CashDrawer } from '../wallets/cash-drawer.entity';
import { CashTransaction } from '../wallets/cash-transaction.entity';
import { CoordinatorProvider } from '../coordinator-providers/coordinator-provider.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { RequestType } from '../common/enums/request-type.enum';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { AgentProvider } from '../agent-providers/agent-provider.entity';
import { User } from '../users/user.entity';

@Injectable()
export class EcashRequestsService {
  constructor(
    @InjectRepository(EcashRequest)
    private requestsRepo: Repository<EcashRequest>,
    @InjectRepository(CoordinatorProvider)
    private coordinatorProvidersRepo: Repository<CoordinatorProvider>,
    @InjectRepository(AgentProvider)
    private agentProvidersRepo: Repository<AgentProvider>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // Step 1: an agent whose wallet is running low asks for a top-up.
  async create(
    agentId: string,
    providerId: string,
    amount: number,
    type: RequestType,
  ) {
    const approved = await this.agentProvidersRepo.findOne({
      where: { agentId, providerId, status: ApplicationStatus.APPROVED },
    });
    if (!approved) {
      throw new ForbiddenException('You are not approved to work with this provider');
    }

    const request = this.requestsRepo.create({
      agentId,
      providerId,
      amount,
      type,
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
    const coordinator = await this.usersRepo.findOne({ where: { id: coordinatorId } });
    if (!coordinator?.areaId) return [];

    const approvedProviderIds = await this.approvedProviderIdsFor(coordinatorId);
    if (approvedProviderIds.length === 0) {
      return [];
    }

    const requests = await this.requestsRepo.find({
      where: { status: RequestStatus.PENDING, providerId: In(approvedProviderIds) },
      relations: ['agent', 'provider'],
      order: { requestedAt: 'ASC' },
    });
    return requests.filter((request) => request.agent.areaId === coordinator.areaId);
  }

  // Step 2: a coordinator says "I'll take care of this one".
  async accept(id: string, coordinatorId: string) {
    return this.dataSource.transaction(async (safe) => {
    // Lock the row while it is claimed, so only the first coordinator wins.
    const request = await safe.findOne(EcashRequest, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
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

    const coordinator = await this.usersRepo.findOne({ where: { id: coordinatorId } });
    const agent = await this.usersRepo.findOne({ where: { id: request.agentId } });
    if (!coordinator?.areaId || coordinator.areaId !== agent?.areaId) {
      throw new ForbiddenException('This request is outside your area');
    }

    request.coordinatorId = coordinatorId;
    request.status = RequestStatus.ACCEPTED;
    return safe.save(request);
    });
  }

  // A provider can see the full request history for its own network.
  providerRequests(providerId: string) {
    return this.requestsRepo.find({
      where: { providerId },
      relations: ['agent', 'coordinator'],
      order: { requestedAt: 'DESC' },
    });
  }

  // The agent can stop an open request before any coordinator takes it.
  async cancel(id: string, agentId: string) {
    const request = await this.requestsRepo.findOne({ where: { id, agentId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only an open request can be cancelled');
    }

    request.status = RequestStatus.CANCELLED;
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
      const request = await safe.findOne(EcashRequest, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) throw new NotFoundException('Request not found');

      if (request.coordinatorId !== coordinatorId) {
        throw new BadRequestException('You have not accepted this request');
      }
      if (request.status !== RequestStatus.ACCEPTED) {
        throw new BadRequestException('This request must be accepted first');
      }

      let agentWallet = await safe.findOne(Wallet, {
        where: { agentId: request.agentId, providerId: request.providerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!agentWallet) {
        agentWallet = safe.create(Wallet, {
          agentId: request.agentId,
          providerId: request.providerId,
          balance: 0,
        });
      }

      let coordinatorWallet = await safe.findOne(Wallet, {
        where: { coordinatorId, providerId: request.providerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!coordinatorWallet) {
        coordinatorWallet = safe.create(Wallet, {
          coordinatorId,
          providerId: request.providerId,
          balance: 0,
        });
      }

      let agentDrawer = await safe.findOne(CashDrawer, {
        where: { agentId: request.agentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!agentDrawer) {
        agentDrawer = safe.create(CashDrawer, {
          agentId: request.agentId,
          balance: 0,
        });
      }

      let coordinatorDrawer = await safe.findOne(CashDrawer, {
        where: { coordinatorId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!coordinatorDrawer) {
        coordinatorDrawer = safe.create(CashDrawer, {
          coordinatorId,
          balance: 0,
        });
      }

      const amount = Number(request.amount);
      if (request.type === RequestType.E_CASH) {
        if (Number(coordinatorWallet.balance) < amount) {
          throw new BadRequestException('Coordinator does not have enough e-cash');
        }
        if (Number(agentDrawer.balance) < amount) {
          throw new BadRequestException('Agent does not have enough physical cash');
        }

        coordinatorWallet.balance = Number(coordinatorWallet.balance) - amount;
        agentWallet.balance = Number(agentWallet.balance) + amount;
        agentDrawer.balance = Number(agentDrawer.balance) - amount;
        coordinatorDrawer.balance = Number(coordinatorDrawer.balance) + amount;
      } else {
        if (Number(coordinatorDrawer.balance) < amount) {
          throw new BadRequestException('Coordinator does not have enough physical cash');
        }
        if (Number(agentWallet.balance) < amount) {
          throw new BadRequestException('Agent does not have enough e-cash');
        }

        coordinatorDrawer.balance = Number(coordinatorDrawer.balance) - amount;
        agentDrawer.balance = Number(agentDrawer.balance) + amount;
        agentWallet.balance = Number(agentWallet.balance) - amount;
        coordinatorWallet.balance = Number(coordinatorWallet.balance) + amount;
      }

      await safe.save([agentWallet, coordinatorWallet, agentDrawer, coordinatorDrawer]);

      const transaction = safe.create(CashTransaction, {
        agentId: request.agentId,
        coordinatorId,
        providerId: request.providerId,
        requestId: request.id,
        type: TransactionType.LIQUIDITY_SWAP,
        amount,
        drawerBalanceAfter: agentDrawer.balance,
        walletBalanceAfter: agentWallet.balance,
      });
      await safe.save(transaction);

      // mark the request as done
      request.status = RequestStatus.FULFILLED;
      request.fulfilledAt = new Date();
      await safe.save(request);

      return { request, transaction };
    });
  }
}
