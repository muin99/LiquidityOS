import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardAgentDto } from './dto/onboard-agent.dto';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
  ) {}
  async create(dto: OnboardAgentDto) {
    try {
      return await this.agents.save(this.agents.create(dto));
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException('This user already has an agent profile');
      throw error;
    }
  }
  async findAll(providerId?: string) {
    return this.agents.find({
      where: providerId ? { providerId } : {},
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string) {
    const agent = await this.agents.findOneBy({ id });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }
  async update(id: string, dto: Partial<OnboardAgentDto>) {
    const agent = await this.findOne(id);
    Object.assign(agent, dto);
    return this.agents.save(agent);
  }
  async remove(id: string) {
    const agent = await this.findOne(id);
    await this.agents.remove(agent);
    return { message: 'Agent deleted' };
  }
}
