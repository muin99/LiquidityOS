import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { OnboardAgentDto } from './dto/onboard-agent.dto';
import { Agent } from './entities/agent.entity';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AreasService } from '../areas/areas.service';
import { ProvidersService } from '../providers/providers.service';
import { UserRole } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AgentListQueryDto } from './dto/agent-list-query.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
    private readonly usersService: UsersService,
    private readonly providersService: ProvidersService,
    private readonly areasService: AreasService,
  ) {}

  async create(dto: OnboardAgentDto) {
    await this.validateReferences(dto.userId, dto.providerId, dto.areaId);

    try {
      return await this.agents.save(this.agents.create(dto));
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException('This user already has an agent profile');
      throw error;
    }
  }
  async findAll(query: AgentListQueryDto) {
    const baseWhere: FindOptionsWhere<Agent> = {
      ...(query.providerId && { providerId: query.providerId }),
      ...(query.areaId && { areaId: query.areaId }),
      ...(query.status && { status: query.status }),
    };

    const where: FindOptionsWhere<Agent> | FindOptionsWhere<Agent>[] =
      query.search
        ? [
            { ...baseWhere, shopName: ILike(`%${query.search}%`) },
            { ...baseWhere, address: ILike(`%${query.search}%`) },
          ]
        : baseWhere;

    const [data, total] = await this.agents.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }
  async findOne(id: string) {
    const agent = await this.agents.findOneBy({ id });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }
  async update(id: string, dto: UpdateAgentDto) {
    const agent = await this.findOne(id);

    await this.validateReferences(dto.userId, dto.providerId, dto.areaId);

    Object.assign(agent, dto);
    try {
      return await this.agents.save(agent);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('This user already has an agent profile');
      }
      throw error;
    }
  }
  async remove(id: string) {
    const agent = await this.findOne(id);
    await this.agents.remove(agent);
    return { message: 'Agent deleted' };
  }

  private async validateReferences(
    userId?: string,
    providerId?: string,
    areaId?: string,
  ): Promise<void> {
    const [user, provider, area] = await Promise.all([
      userId ? this.usersService.findById(userId) : null,
      providerId ? this.providersService.findOne(providerId) : null,
      areaId ? this.areasService.findOne(areaId) : null,
    ]);

    if (userId && !user) {
      throw new NotFoundException('User not found');
    }
    if (user && user.role !== UserRole.AGENT) {
      throw new ConflictException('User must have the agent role');
    }
    if (provider && provider.status !== 'approved') {
      throw new ConflictException('Provider must be approved');
    }
    if (area && area.status !== 'active') {
      throw new ConflictException('Area must be active');
    }
  }
}
