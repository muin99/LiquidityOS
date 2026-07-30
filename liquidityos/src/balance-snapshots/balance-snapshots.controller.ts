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
import { BalanceSnapshotsService } from './balance-snapshots.service';
import { CreateBalanceSnapshotDto } from './dto/create-balance-snapshot.dto';
import { UpdateBalanceSnapshotDto } from './dto/update-balance-snapshot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('balance-snapshots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BalanceSnapshotsController {
  constructor(
    private readonly balanceSnapshotsService: BalanceSnapshotsService,
  ) {}

  @Post()
  @Roles(UserRole.AGENT)
  create(@Body() createBalanceSnapshotDto: CreateBalanceSnapshotDto) {
    return this.balanceSnapshotsService.create(createBalanceSnapshotDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.AGENT)
  findAll() {
    return this.balanceSnapshotsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.AGENT)
  findOne(@Param('id') id: string) {
    return this.balanceSnapshotsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.AGENT)
  update(
    @Param('id') id: string,
    @Body() updateBalanceSnapshotDto: UpdateBalanceSnapshotDto,
  ) {
    return this.balanceSnapshotsService.update(id, updateBalanceSnapshotDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.balanceSnapshotsService.remove(id);
  }
}
