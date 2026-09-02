import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoordinatorProvider } from './coordinator-provider.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

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

  // A provider only sees applications sent to THEM. An admin (no
  // providerId passed in) sees everyone waiting, for every provider.
  pendingApplications(providerId?: string) {
    if (providerId) {
      return this.repo.find({
        where: { status: ApplicationStatus.PENDING, providerId },
      });
    }
    return this.repo.find({ where: { status: ApplicationStatus.PENDING } });
  }

  // The provider (or admin) says yes/no to a pending application.
  async decide(
    id: string,
    status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED,
    requester: { role: UserRole; providerId?: string },
  ) {
    const application = await this.repo.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // A provider can only decide on applications sent to their OWN
    // provider — not anyone else's. An admin can decide on any of them.
    if (
      requester.role === UserRole.PROVIDER &&
      application.providerId !== requester.providerId
    ) {
      throw new ForbiddenException(
        'This application was not sent to your provider',
      );
    }

    application.status = status;
    application.decidedAt = new Date();
    return this.repo.save(application);
  }
}
