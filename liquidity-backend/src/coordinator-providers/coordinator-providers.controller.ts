import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoordinatorProvidersService } from './coordinator-providers.service';
import { ApplyToProviderDto } from './dto/apply.dto';
import { DecideApplicationDto } from './dto/decide.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('coordinator-providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coordinator-providers')
export class CoordinatorProvidersController {
  constructor(private service: CoordinatorProvidersService) {}

  // A coordinator applies to work with a provider.
  @Roles(UserRole.COORDINATOR)
  @Post('apply')
  apply(@CurrentUser() user: { id: string }, @Body() dto: ApplyToProviderDto) {
    return this.service.apply(user.id, dto.providerId);
  }

  // A coordinator checks the status of their own applications.
  @Roles(UserRole.COORDINATOR)
  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.service.myApplications(user.id);
  }

  // An admin sees everyone still waiting for a decision.
  @Roles(UserRole.ADMIN)
  @Get('pending')
  pending() {
    return this.service.pendingApplications();
  }

  // An admin approves or rejects one application.
  @Roles(UserRole.ADMIN)
  @Patch(':id/decide')
  decide(@Param('id') id: string, @Body() dto: DecideApplicationDto) {
    return this.service.decide(id, dto.status);
  }
}
