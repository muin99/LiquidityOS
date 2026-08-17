import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EcashRequestsService } from './ecash-requests.service';
import { CreateEcashRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('ecash-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ecash-requests')
export class EcashRequestsController {
  constructor(private service: EcashRequestsService) {}

  // Agent: "my wallet is dry, please send me e-cash"
  @Roles(UserRole.AGENT)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateEcashRequestDto) {
    return this.service.create(user.id, dto.providerId, dto.amount);
  }

  // Coordinator: see everyone who's asking for e-cash right now
  @Roles(UserRole.COORDINATOR)
  @Get('pending')
  pending() {
    return this.service.pendingRequests();
  }

  // Coordinator: "I'll handle this one"
  @Roles(UserRole.COORDINATOR)
  @Patch(':id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.accept(id, user.id);
  }

  // Coordinator: actually send the e-cash, closing the request out
  @Roles(UserRole.COORDINATOR)
  @Patch(':id/fulfill')
  fulfill(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.fulfill(id, user.id);
  }
}
