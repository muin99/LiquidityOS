import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardCoordinatorDto } from './dto/onboard-coordinator.dto';
import { LiquidityCoordinator } from './entities/liquidity-coordinator.entity';
@Injectable()
export class CoordinatorsService {
  constructor(
    @InjectRepository(LiquidityCoordinator)
    private readonly coordinators: Repository<LiquidityCoordinator>,
  ) {}
  async create(dto: OnboardCoordinatorDto) {
    try {
      return await this.coordinators.save(this.coordinators.create(dto));
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException(
          'This user already has a coordinator profile',
        );
      throw error;
    }
  }
  findAll() {
    return this.coordinators.find({ order: { createdAt: 'DESC' } });
  }
  async findOne(id: string) {
    const coordinator = await this.coordinators.findOneBy({ id });
    if (!coordinator) throw new NotFoundException('Coordinator not found');
    return coordinator;
  }
  async update(id: string, dto: Partial<OnboardCoordinatorDto>) {
    const coordinator = await this.findOne(id);
    Object.assign(coordinator, dto);
    return this.coordinators.save(coordinator);
  }
  async remove(id: string) {
    const coordinator = await this.findOne(id);
    await this.coordinators.remove(coordinator);
    return { message: 'Coordinator deleted' };
  }
}
