import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';
@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>,
  ) {}
  create(dto: CreateWalletDto) {
    return this.wallets.save(
      this.wallets.create({
        ...dto,
        ownerType: dto.ownerType.toLowerCase() as Wallet['ownerType'],
        walletType: dto.walletType.toLowerCase() as Wallet['walletType'],
        balance: '0',
      }),
    );
  }
  findAll(providerId?: string, ownerId?: string) {
    return this.wallets.find({
      where: { ...(providerId && { providerId }), ...(ownerId && { ownerId }) },
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string) {
    const wallet = await this.wallets.findOneBy({ id });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
  async update(id: string, data: Partial<Pick<Wallet, 'status'>>) {
    const wallet = await this.findOne(id);
    Object.assign(wallet, data);
    return this.wallets.save(wallet);
  }
  async remove(id: string) {
    const wallet = await this.findOne(id);
    if (BigInt(wallet.balance) !== 0n)
      throw new ConflictException('Only zero-balance wallets can be deleted');
    await this.wallets.remove(wallet);
    return { message: 'Wallet deleted' };
  }
}
