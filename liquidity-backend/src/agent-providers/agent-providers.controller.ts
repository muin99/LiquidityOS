import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AgentProvidersService } from './agent-providers.service';
import { ApplyToProviderDto } from './dto/apply.dto';
import { DecideAgentApplicationDto } from './dto/decide.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('agent-providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agent-providers')
export class AgentProvidersController {
  constructor(private service: AgentProvidersService) {}

  @Roles(UserRole.AGENT)
  @Post('apply')
  apply(@CurrentUser() user: { id: string }, @Body() dto: ApplyToProviderDto) {
    return this.service.apply(user.id, dto.providerId);
  }

  @Roles(UserRole.AGENT)
  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.service.myApplications(user.id);
  }

  @Roles(UserRole.AGENT)
  @Get('approved')
  approved(@CurrentUser() user: { id: string }) {
    return this.service.approvedProviders(user.id);
  }

  @Roles(UserRole.PROVIDER)
  @Get('pending')
  pending(@CurrentUser() user: { providerId?: string }) {
    return this.service.pendingApplications(user.providerId as string);
  }

  @Roles(UserRole.PROVIDER)
  @Get('approved-for-provider')
  approvedForProvider(@CurrentUser() user: { providerId?: string }) {
    return this.service.approvedApplications(user.providerId as string);
  }

  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @Patch(':id/decide')
  decide(
    @Param('id') id: string,
    @Body() dto: DecideAgentApplicationDto,
    @CurrentUser() user: { role: UserRole; providerId?: string },
  ) {
    return this.service.decide(id, dto.status, user);
  }

  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @Patch(':id/restrict')
  restrict(
    @Param('id') id: string,
    @CurrentUser() user: { role: UserRole; providerId?: string },
  ) {
    return this.service.restrict(id, user);
  }
}
