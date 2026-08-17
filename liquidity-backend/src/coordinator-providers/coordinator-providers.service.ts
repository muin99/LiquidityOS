import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoordinatorProvider } from './coordinator-provider.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';

@Injectable()
export class CoordinatorProvidersService {
  constructor(
    @InjectRepository(CoordinatorProvider)
    private repo: Repository<CoordinatorProvider>,
  ) {}

  // A coordinator asks to work with one provider.
  async apply(coordinatorId: string, providerId: string) {
    const already = await this.repo.findOne({
      where: { coordinatorId, providerId },
    });
    if (already) {
      throw new ConflictException('You already applied to this provider');
    }

    const application = this.repo.create({
      coordinatorId,
      providerId,
      status: ApplicationStatus.PENDING,
    });
    return this.repo.save(application);
  }

  myApplications(coordinatorId: string) {
    return this.repo.find({ where: { coordinatorId } });
  }

  pendingApplications() {
    return this.repo.find({ where: { status: ApplicationStatus.PENDING } });
  }

  // The provider (or admin) says yes/no to a pending application.
  async decide(
    id: string,
    status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED,
  ) {
    const application = await this.repo.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    application.status = status;
    application.decidedAt = new Date();
    return this.repo.save(application);
  }
}
