import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.providersRepo.find({ where: { isActive: true } });
  }

  findAllForAdmin() {
    return this.providersRepo.find();
  }

  findById(id: string) {
    return this.providersRepo.findOne({ where: { id } });
  }

  create(name: string) {
    const provider = this.providersRepo.create({ name });
    return this.providersRepo.save(provider);
  }

  async setActive(id: string, isActive: boolean) {
    const provider = await this.providersRepo.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');
    provider.isActive = isActive;
    return this.providersRepo.save(provider);
  }
}
