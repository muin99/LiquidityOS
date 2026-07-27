import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { ProviderActionDto } from './dto/provider-action.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ProviderListQueryDto } from './dto/provider-list-query.dto';
import { SupplyLiquidityDto } from './dto/supply-liquidity.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProvidersService } from './providers.service';

@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: ProviderListQueryDto) {
    return this.providersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(id, dto);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string, @Body() dto: ProviderActionDto) {
    return this.providersService.approve(id, dto.approvalNote);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string, @Body() dto: ProviderActionDto) {
    return this.providersService.reject(id, dto.rejectionReason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }

  @Get(':id/agents')
  listAgents(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.providersService.listAgents(
      id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(':id/coordinators')
  listCoordinators(
    @Param('id') id: string,
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
  ) {
    return this.providersService.listCoordinators(id, status);
  }

  @Post(':id/coordinators/:coordinatorId/approve')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  approveCoordinator(
    @Param('id') id: string,
    @Param('coordinatorId') coordinatorId: string,
    @Body() dto: ProviderActionDto,
  ) {
    return this.providersService.approveCoordinator(
      id,
      coordinatorId,
      dto.approvalNote,
    );
  }

  @Post(':id/coordinators/:coordinatorId/reject')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  rejectCoordinator(
    @Param('id') id: string,
    @Param('coordinatorId') coordinatorId: string,
    @Body() dto: ProviderActionDto,
  ) {
    return this.providersService.rejectCoordinator(
      id,
      coordinatorId,
      dto.rejectionReason,
    );
  }

  @Get(':id/shortages')
  shortages(@Param('id') id: string, @Query('status') status?: string) {
    return this.providersService.shortages(id, status);
  }

  @Get(':id/dashboard')
  dashboard(@Param('id') id: string) {
    return this.providersService.dashboard(id);
  }

  @Post(':id/wallets/supply')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  supply(
    @Param('id') id: string,
    @Body() dto: SupplyLiquidityDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.providersService.supply(id, dto, idempotencyKey);
  }
}
