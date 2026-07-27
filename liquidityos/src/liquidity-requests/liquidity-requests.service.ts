import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLiquidityRequestDto } from './dto/create-liquidity-request.dto';
import { LiquidityRequest } from './entities/liquidity-request.entity';
import { UpdateLiquidityRequestDto } from './dto/update-liquidity-request.dto';
@Injectable()
export class LiquidityRequestsService {
  constructor(
    @InjectRepository(LiquidityRequest)
    private readonly requests: Repository<LiquidityRequest>,
  ) {}
  async create(dto: CreateLiquidityRequestDto) {
    if (new Date(dto.expiresAt) <= new Date())
      throw new BadRequestException('Expiry date must be in the future');
    return this.requests.save(
      this.requests.create({
        requesterId: dto.requesterId,
        requesterType:
          dto.requesterType.toLowerCase() as LiquidityRequest['requesterType'],
        liquidityType:
          dto.liquidityType.toLowerCase() as LiquidityRequest['liquidityType'],
        providerId: dto.providerId,
        areaId: dto.areaId,
        amount: String(dto.amount),
        urgency: dto.urgency.toLowerCase() as LiquidityRequest['urgency'],
        allowPartial: dto.allowPartial ?? false,
        notes: dto.notes,
        expiresAt: new Date(dto.expiresAt),
        status: 'open',
      }),
    );
  }
  findAll(providerId?: string, status?: string) {
    return this.requests.find({
      where: { ...(providerId && { providerId }), ...(status && { status }) },
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string) {
    const request = await this.requests.findOneBy({ id });
    if (!request) throw new NotFoundException('Liquidity request not found');
    return request;
  }
  async update(id: string, dto: UpdateLiquidityRequestDto) {
    const request = await this.findOne(id);
    if (request.status !== 'open')
      throw new BadRequestException('Only open requests can be updated');
    if (dto.expiresAt && new Date(dto.expiresAt) <= new Date())
      throw new BadRequestException('Expiry date must be in the future');
    Object.assign(
      request,
      dto.amount && { amount: String(dto.amount) },
      dto.urgency && { urgency: dto.urgency.toLowerCase() },
      dto.expiresAt && { expiresAt: new Date(dto.expiresAt) },
      dto.allowPartial !== undefined && { allowPartial: dto.allowPartial },
      dto.notes !== undefined && { notes: dto.notes },
    );
    return this.requests.save(request);
  }
  async cancel(id: string) {
    const request = await this.findOne(id);
    if (request.status !== 'open')
      throw new BadRequestException('Only open requests can be cancelled');
    request.status = 'cancelled';
    return this.requests.save(request);
  }
  async remove(id: string) {
    const request = await this.findOne(id);
    await this.requests.remove(request);
    return { message: 'Liquidity request deleted' };
  }
}
