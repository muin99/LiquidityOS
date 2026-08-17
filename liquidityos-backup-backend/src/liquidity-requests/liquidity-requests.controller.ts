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
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdateLiquidityRequestDto } from './dto/update-liquidity-request.dto';
@Controller('liquidity-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiquidityRequestsController {
  constructor(private readonly requests: LiquidityRequestsService) {}
  @Post()
  @Roles(UserRole.PROVIDER, UserRole.AGENT, UserRole.COORDINATOR)
  create(@Body() dto: CreateLiquidityRequestDto) {
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
    @Body() dto: UpdateLiquidityRequestDto,
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
