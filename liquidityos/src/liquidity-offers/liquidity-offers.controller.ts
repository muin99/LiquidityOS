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
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateLiquidityOfferDto } from './dto/create-liquidity-offer.dto';
import { LiquidityOffersService } from './liquidity-offers.service';
@Controller('liquidity-offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiquidityOffersController {
  constructor(private readonly offers: LiquidityOffersService) {}
  @Post() @Roles(UserRole.COORDINATOR) create(
    @Body() dto: CreateLiquidityOfferDto,
  ) {
    return this.offers.create(dto);
  }
  @Get() findAll(
    @Query('requestId') requestId?: string,
    @Query('coordinatorId') coordinatorId?: string,
  ) {
    return this.offers.findAll(requestId, coordinatorId);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.offers.findOne(id);
  }
  @Patch(':id') @Roles(UserRole.COORDINATOR) update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLiquidityOfferDto>,
  ) {
    return this.offers.update(id, dto);
  }
  @Post(':id/withdraw') @Roles(UserRole.COORDINATOR) withdraw(
    @Param('id') id: string,
  ) {
    return this.offers.withdraw(id);
  }
  @Delete(':id') @Roles(UserRole.ADMIN, UserRole.COORDINATOR) remove(
    @Param('id') id: string,
  ) {
    return this.offers.remove(id);
  }
}
