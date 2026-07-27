import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto';
import { Area } from './entities/area.entity';
@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area) private readonly areas: Repository<Area>,
  ) {}
  async create(dto: CreateAreaDto) {
    try {
      return await this.areas.save(this.areas.create(dto));
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException('Area code already exists');
      throw error;
    }
  }
  findAll() {
    return this.areas.find({ order: { name: 'ASC' } });
  }
  async findOne(id: string) {
    const area = await this.areas.findOneBy({ id });
    if (!area) throw new NotFoundException('Area not found');
    return area;
  }
  async update(id: string, dto: Partial<CreateAreaDto>) {
    const area = await this.findOne(id);
    Object.assign(area, dto);
    return this.areas.save(area);
  }
  async remove(id: string) {
    const area = await this.findOne(id);
    await this.areas.remove(area);
    return { message: 'Area deleted' };
  }
}
