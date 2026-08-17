import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepo: Repository<Provider>,
  ) {}

  findAll() {
    return this.providersRepo.find();
  }

  findById(id: string) {
    return this.providersRepo.findOne({ where: { id } });
  }

  create(name: string) {
    const provider = this.providersRepo.create({ name });
    return this.providersRepo.save(provider);
  }
}
