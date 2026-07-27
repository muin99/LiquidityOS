import { Body, Controller, Post } from '@nestjs/common';
import { CreateLiquidityTransferDto } from './dto/create-liquidity-transfer.dto';
import { LiquidityTransfersService } from './liquidity-transfers.service';

@Controller('liquidity-transfers')
export class LiquidityTransfersController {
  constructor(
    private readonly liquidityTransfersService: LiquidityTransfersService,
  ) {}

  @Post('check')
  checkTransfer(
    @Body() createLiquidityTransferDto: CreateLiquidityTransferDto,
  ) {
    return this.liquidityTransfersService.checkTransfer(
      createLiquidityTransferDto,
    );
  }
}
