import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenDisputeDto } from './dto/open-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { Dispute } from './entities/dispute.entity';
@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute) private readonly disputes: Repository<Dispute>,
  ) {}
  async open(dto: OpenDisputeDto, openedBy: string) {
    if (!dto.requestId && !dto.transferId)
      throw new BadRequestException('A requestId or transferId is required');
    return this.disputes.save(this.disputes.create({ ...dto, openedBy }));
  }
  findAll() {
    return this.disputes.find({ order: { createdAt: 'DESC' } });
  }
  async findOne(id: string) {
    const dispute = await this.disputes.findOneBy({ id });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }
  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.findOne(id);
    dispute.status = dto.resolutionType;
    dispute.resolutionNote = dto.note;
    return this.disputes.save(dispute);
  }
}
