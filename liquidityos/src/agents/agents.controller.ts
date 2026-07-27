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
import { AgentsService } from './agents.service';
import { OnboardAgentDto } from './dto/onboard-agent.dto';
@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}
  @Post('onboard') @Roles(UserRole.ADMIN, UserRole.PROVIDER) create(
    @Body() dto: OnboardAgentDto,
  ) {
    return this.agents.create(dto);
  }
  @Get() findAll(@Query('providerId') providerId?: string) {
    return this.agents.findAll(providerId);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.agents.findOne(id);
  }
  @Patch(':id') @Roles(UserRole.ADMIN, UserRole.PROVIDER) update(
    @Param('id') id: string,
    @Body() dto: Partial<OnboardAgentDto>,
  ) {
    return this.agents.update(id, dto);
  }
  @Delete(':id') @Roles(UserRole.ADMIN) remove(@Param('id') id: string) {
    return this.agents.remove(id);
  }
}
