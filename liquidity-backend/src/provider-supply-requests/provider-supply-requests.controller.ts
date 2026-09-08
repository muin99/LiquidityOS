import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProviderSupplyRequestsService } from './provider-supply-requests.service';
import { CreateProviderSupplyRequestDto } from './dto/create-provider-supply-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('provider-supply-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provider-supply-requests')
export class ProviderSupplyRequestsController {
  constructor(private service: ProviderSupplyRequestsService) {}

  @Roles(UserRole.COORDINATOR)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateProviderSupplyRequestDto) {
    return this.service.create(user.id, dto.providerId, dto.type, dto.amount);
  }

  @Roles(UserRole.COORDINATOR)
  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.service.mine(user.id);
  }

  @Roles(UserRole.PROVIDER)
  @Get('pending')
  pending(@CurrentUser() user: { providerId?: string }) {
    return this.service.pending(user.providerId as string);
  }

  @Roles(UserRole.PROVIDER)
  @Patch(':id/fulfill')
  fulfill(@Param('id') id: string, @CurrentUser() user: { providerId?: string }) {
    return this.service.fulfill(id, user.providerId as string);
  }

  @Roles(UserRole.PROVIDER)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: { providerId?: string }) {
    return this.service.reject(id, user.providerId as string);
  }
}
