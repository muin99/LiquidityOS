import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CoordinatorsService } from './coordinators.service';
import { OnboardCoordinatorDto } from './dto/onboard-coordinator.dto';
@Controller('coordinators')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoordinatorsController {
  constructor(private readonly coordinators: CoordinatorsService) {}
  @Post('onboard') @Roles(UserRole.ADMIN) create(
    @Body() dto: OnboardCoordinatorDto,
  ) {
    return this.coordinators.create(dto);
  }
  @Get() findAll() {
    return this.coordinators.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.coordinators.findOne(id);
  }
  @Patch(':id') @Roles(UserRole.ADMIN) update(
    @Param('id') id: string,
    @Body() dto: Partial<OnboardCoordinatorDto>,
  ) {
    return this.coordinators.update(id, dto);
  }
  @Delete(':id') @Roles(UserRole.ADMIN) remove(@Param('id') id: string) {
    return this.coordinators.remove(id);
  }
}
