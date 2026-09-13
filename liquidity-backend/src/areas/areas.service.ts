import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './area.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepo: Repository<Area>,
  ) {}

  findAll() {
    return this.areasRepo.find({ where: { isActive: true } });
  }

  findAllForAdmin() {
    return this.areasRepo.find();
  }

  findById(id: string) {
    return this.areasRepo.findOne({ where: { id } });
  }

  create(name: string, region: string) {
    const area = this.areasRepo.create({ name, region });
    return this.areasRepo.save(area);
  }

  async setActive(id: string, isActive: boolean) {
    const area = await this.areasRepo.findOne({ where: { id } });
    if (!area) throw new NotFoundException('Area not found');
    area.isActive = isActive;
    return this.areasRepo.save(area);
  }
}
