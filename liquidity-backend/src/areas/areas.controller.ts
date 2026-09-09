import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('areas')
@Controller('areas')
export class AreasController {
  constructor(private areasService: AreasService) {}

  // Anyone (even before logging in) can see the list of areas,
  // because you need it to pick one while registering.
  @Get()
  findAll() {
    return this.areasService.findAll();
  }

  // Only an admin can add new areas.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateAreaDto) {
    return this.areasService.create(dto.name, dto.region);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  findAllForAdmin() {
    return this.areasService.findAllForAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.areasService.setActive(id, false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.areasService.setActive(id, true);
  }
}
