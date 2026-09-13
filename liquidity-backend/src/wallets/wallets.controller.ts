import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CashMoveDto } from './dto/cash-move.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProviderMoneyDto, ProviderSupplyDto } from './dto/provider-money.dto';

// Only an agent has a cash drawer / e-cash wallets, so every route here
// is locked to UserRole.AGENT.
@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Roles(UserRole.AGENT)
  @Get('me')
  myWallets(@CurrentUser() user: { id: string }) {
    return this.walletsService.myWallets(user.id);
  }

  @Roles(UserRole.PROVIDER)
  @Get('provider-transactions')
  providerTransactions(@CurrentUser() user: { providerId?: string }) {
    return this.walletsService.providerTransactions(user.providerId as string);
  }

  @Roles(UserRole.PROVIDER)
  @Get('provider-balances')
  providerBalances(@CurrentUser() user: { providerId?: string }) {
    return this.walletsService.providerBalances(user.providerId as string);
  }

  @Roles(UserRole.PROVIDER)
  @Get('provider-daily-summary')
  providerDailySummary(@CurrentUser() user: { providerId?: string }) {
    return this.walletsService.providerDailySummary(user.providerId as string);
  }

  @Roles(UserRole.PROVIDER)
  @Post('provider-reserve')
  addProviderReserve(
    @CurrentUser() user: { providerId?: string },
    @Body() dto: ProviderMoneyDto,
  ) {
    return this.walletsService.addProviderReserve(
      user.providerId as string,
      dto.type,
      dto.amount,
    );
  }

  @Roles(UserRole.PROVIDER)
  @Post('provider-supply')
  supplyCoordinator(
    @CurrentUser() user: { providerId?: string },
    @Body() dto: ProviderSupplyDto,
  ) {
    return this.walletsService.supplyCoordinator(
      user.providerId as string,
      dto.coordinatorId,
      dto.type,
      dto.amount,
    );
  }

  // The agent's own cash-in/cash-out history, so the dashboard can
  // chart the drawer/wallet balance moving over time.
  @Roles(UserRole.AGENT)
  @Get('transactions')
  myTransactions(@CurrentUser() user: { id: string }) {
    return this.walletsService.myTransactions(user.id);
  }

  @Roles(UserRole.AGENT)
  @Post('cash-in')
  cashIn(@CurrentUser() user: { id: string }, @Body() dto: CashMoveDto) {
    return this.walletsService.cashIn(user.id, dto.providerId, dto.amount);
  }

  @Roles(UserRole.AGENT)
  @Post('cash-out')
  cashOut(@CurrentUser() user: { id: string }, @Body() dto: CashMoveDto) {
    return this.walletsService.cashOut(user.id, dto.providerId, dto.amount);
  }
}
