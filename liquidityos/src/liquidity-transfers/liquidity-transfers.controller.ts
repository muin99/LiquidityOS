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
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateLiquidityTransferDto } from './dto/create-liquidity-transfer.dto';
import { LiquidityTransfersService } from './liquidity-transfers.service';
@Controller('liquidity-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiquidityTransfersController {
  constructor(private readonly transfers: LiquidityTransfersService) {}
  @Post()
  @Roles(UserRole.PROVIDER, UserRole.AGENT, UserRole.COORDINATOR)
  create(
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
