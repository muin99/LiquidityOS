import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto';
import { Area } from './entities/area.entity';
import { UpdateAreaDto } from './dto/update-area.dto';
import { AreaListQueryDto } from './dto/area-list-query.dto';

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
  async findAll(query: AreaListQueryDto) {
    const baseWhere: FindOptionsWhere<Area> = {
      ...(query.status && { status: query.status }),
    };

    const where: FindOptionsWhere<Area> | FindOptionsWhere<Area>[] =
      query.search
        ? [
            { ...baseWhere, name: ILike(`%${query.search}%`) },
            { ...baseWhere, code: ILike(`%${query.search}%`) },
          ]
        : baseWhere;

    const [data, total] = await this.areas.findAndCount({
      where,
      order: { name: 'ASC' },
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
    const area = await this.areas.findOneBy({ id });
    if (!area) throw new NotFoundException('Area not found');
    return area;
  }
  async update(id: string, dto: UpdateAreaDto) {
    const area = await this.findOne(id);
    Object.assign(area, dto);
    try {
      return await this.areas.save(area);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Area code already exists');
      }
      throw error;
    }
  }
  async remove(id: string) {
    const area = await this.findOne(id);
    await this.areas.remove(area);
    return { message: 'Area deleted' };
  }
}
