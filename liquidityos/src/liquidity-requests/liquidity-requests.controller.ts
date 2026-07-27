import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLiquidityRequestDto } from './dto/create-liquidity-request.dto';
import { LiquidityRequestsService } from './liquidity-requests.service';
@Controller('liquidity-requests')
@UseGuards(JwtAuthGuard)
export class LiquidityRequestsController {
  constructor(private readonly requests: LiquidityRequestsService) {}
  @Post() create(@Body() dto: CreateLiquidityRequestDto) {
    return this.requests.create(dto);
  }
  @Get() findAll(
    @Query('providerId') providerId?: string,
    @Query('status') status?: string,
  ) {
    return this.requests.findAll(providerId, status);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.requests.findOne(id);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLiquidityRequestDto>,
  ) {
    return this.requests.update(id, dto);
  }
  @Post(':id/cancel') cancel(@Param('id') id: string) {
    return this.requests.cancel(id);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.requests.remove(id);
  }
}
