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
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(private readonly areas: AreasService) {}
  @Post() @Roles(UserRole.ADMIN) create(@Body() dto: CreateAreaDto) {
    return this.areas.create(dto);
  }
  @Get() findAll() {
    return this.areas.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.areas.findOne(id);
  }
  @Patch(':id') @Roles(UserRole.ADMIN) update(
    @Param('id') id: string,
    @Body() dto: UpdateAreaDto,
  ) {
    return this.areas.update(id, dto);
  }
  @Delete(':id') @Roles(UserRole.ADMIN) remove(@Param('id') id: string) {
    return this.areas.remove(id);
  }
}
