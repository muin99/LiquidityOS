import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { PointTransaction } from './entities/point-transaction.entity';
@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly points: Repository<PointTransaction>,
  ) {}
  async balance(userId: string) {
    const result = await this.points
      .createQueryBuilder('point')
      .select('COALESCE(SUM(point.points), 0)', 'balance')
      .where('point.userId = :userId', { userId })
      .getRawOne<{ balance: string }>();
    return { balance: Number(result?.balance ?? 0) };
  }
  transactions(userId: string) {
    return this.points.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
  async redeem(userId: string, dto: RedeemPointsDto) {
    const { balance } = await this.balance(userId);
    if (balance < dto.points)
      throw new BadRequestException('Insufficient points');
    return this.points.save(
      this.points.create({
        userId,
        activityType: 'redeemed',
        points: -dto.points,
      }),
    );
  }
}
