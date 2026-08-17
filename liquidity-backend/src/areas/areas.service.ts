import { Injectable } from '@nestjs/common';
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
    return this.areasRepo.find();
  }

  create(name: string, region: string) {
    const area = this.areasRepo.create({ name, region });
    return this.areasRepo.save(area);
  }
}
