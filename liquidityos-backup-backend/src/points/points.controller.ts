import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { PointsService } from './points.service';
@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly points: PointsService) {}
  @Get('balance') balance(@Req() req: { user: { id: string } }) {
    return this.points.balance(req.user.id);
  }
  @Get('transactions') transactions(@Req() req: { user: { id: string } }) {
    return this.points.transactions(req.user.id);
  }
  @Post('redeem') redeem(
    @Req() req: { user: { id: string } },
    @Body() dto: RedeemPointsDto,
  ) {
    return this.points.redeem(req.user.id, dto);
  }
}
