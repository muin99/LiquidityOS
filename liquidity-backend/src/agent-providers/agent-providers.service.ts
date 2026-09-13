import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentProvider } from './agent-provider.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AgentProvidersService {
  constructor(
    @InjectRepository(AgentProvider)
    private repo: Repository<AgentProvider>,
  ) {}

  async apply(agentId: string, providerId: string) {
    const already = await this.repo.findOne({ where: { agentId, providerId } });
    if (already) throw new ConflictException('You already applied to this provider');

    return this.repo.save(
      this.repo.create({ agentId, providerId, status: ApplicationStatus.PENDING }),
    );
  }

  myApplications(agentId: string) {
    return this.repo.find({ where: { agentId }, relations: ['provider'] });
  }

  approvedProviders(agentId: string) {
    return this.repo.find({
      where: { agentId, status: ApplicationStatus.APPROVED },
      relations: ['provider'],
    });
  }

  pendingApplications(providerId: string) {
    return this.repo.find({
      where: { providerId, status: ApplicationStatus.PENDING },
      relations: ['agent', 'provider'],
    });
  }

  approvedApplications(providerId: string) {
    return this.repo.find({
      where: { providerId, status: ApplicationStatus.APPROVED },
      relations: ['agent'],
    });
  }

  async decide(
    id: string,
    status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED,
    requester: { role: UserRole; providerId?: string },
  ) {
    const application = await this.repo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Agent application not found');
    if (
      requester.role === UserRole.PROVIDER &&
      application.providerId !== requester.providerId
    ) {
      throw new ForbiddenException('This application was not sent to your provider');
    }

    application.status = status;
    application.decidedAt = new Date();
    return this.repo.save(application);
  }

  async restrict(id: string, requester: { role: UserRole; providerId?: string }) {
    const application = await this.repo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Agent application not found');
    if (
      requester.role === UserRole.PROVIDER &&
      application.providerId !== requester.providerId
    ) {
      throw new ForbiddenException('This agent is not part of your provider');
    }

    application.status = ApplicationStatus.PENDING;
    return this.repo.save(application);
  }
}
