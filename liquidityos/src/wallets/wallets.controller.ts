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
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletsService } from './wallets.service';
@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletsController {
  constructor(private readonly wallets: WalletsService) {}
  @Post() @Roles(UserRole.ADMIN, UserRole.PROVIDER) create(
    @Body() dto: CreateWalletDto,
  ) {
    return this.wallets.create(dto);
  }
  @Get() findAll(
    @Query('providerId') providerId?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.wallets.findAll(providerId, ownerId);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.wallets.findOne(id);
  }
  @Patch(':id') @Roles(UserRole.ADMIN, UserRole.PROVIDER) update(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'frozen',
  ) {
    return this.wallets.update(id, { status });
  }
  @Delete(':id') @Roles(UserRole.ADMIN) remove(@Param('id') id: string) {
    return this.wallets.remove(id);
  }
}
