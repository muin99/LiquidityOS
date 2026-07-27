import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLiquidityOfferDto } from './dto/create-liquidity-offer.dto';
import { LiquidityOffer } from './entities/liquidity-offer.entity';
@Injectable()
export class LiquidityOffersService {
  constructor(
    @InjectRepository(LiquidityOffer)
    private readonly offers: Repository<LiquidityOffer>,
  ) {}
  create(dto: CreateLiquidityOfferDto) {
    return this.offers.save(
      this.offers.create({
        ...dto,
        availableAmount: String(dto.availableAmount),
      }),
    );
  }
  findAll(requestId?: string, coordinatorId?: string) {
    return this.offers.find({
      where: {
        ...(requestId && { requestId }),
        ...(coordinatorId && { coordinatorId }),
      },
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string) {
    const offer = await this.offers.findOneBy({ id });
    if (!offer) throw new NotFoundException('Liquidity offer not found');
    return offer;
  }
  async update(id: string, dto: Partial<CreateLiquidityOfferDto>) {
    const offer = await this.findOne(id);
    if (offer.status !== 'submitted')
      throw new BadRequestException('Only submitted offers can be updated');
    Object.assign(
      offer,
      dto,
      dto.availableAmount && { availableAmount: String(dto.availableAmount) },
    );
    return this.offers.save(offer);
  }
  async withdraw(id: string) {
    const offer = await this.findOne(id);
    if (offer.status !== 'submitted')
      throw new BadRequestException('Only submitted offers can be withdrawn');
    offer.status = 'withdrawn';
    return this.offers.save(offer);
  }
  async remove(id: string) {
    const offer = await this.findOne(id);
    await this.offers.remove(offer);
    return { message: 'Liquidity offer deleted' };
  }
}
