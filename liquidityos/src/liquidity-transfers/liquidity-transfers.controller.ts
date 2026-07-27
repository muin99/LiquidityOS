import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLiquidityTransferDto } from './dto/create-liquidity-transfer.dto';
import { LiquidityTransfersService } from './liquidity-transfers.service';
@Controller('liquidity-transfers')
@UseGuards(JwtAuthGuard)
export class LiquidityTransfersController {
  constructor(private readonly transfers: LiquidityTransfersService) {}
  @Post() create(
    @Body() dto: CreateLiquidityTransferDto,
    @Headers('idempotency-key') key?: string,
  ) {
    return this.transfers.create(dto, key);
  }
  @Get() findAll() {
    return this.transfers.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.transfers.findOne(id);
  }
}
