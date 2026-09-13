import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CashMoveDto } from './dto/cash-move.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// Only an agent has a cash drawer / e-cash wallets, so every route here
// is locked to UserRole.AGENT.
@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AGENT)
@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get('me')
  myWallets(@CurrentUser() user: { id: string }) {
    return this.walletsService.myWallets(user.id);
  }

  // The agent's own cash-in/cash-out history, so the dashboard can
  // chart the drawer/wallet balance moving over time.
  @Get('transactions')
  myTransactions(@CurrentUser() user: { id: string }) {
    return this.walletsService.myTransactions(user.id);
  }

  @Post('cash-in')
  cashIn(@CurrentUser() user: { id: string }, @Body() dto: CashMoveDto) {
    return this.walletsService.cashIn(user.id, dto.providerId, dto.amount);
  }

  @Post('cash-out')
  cashOut(@CurrentUser() user: { id: string }, @Body() dto: CashMoveDto) {
    return this.walletsService.cashOut(user.id, dto.providerId, dto.amount);
  }
}
