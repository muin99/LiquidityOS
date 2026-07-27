import { Body, Controller, Post } from '@nestjs/common';
import { CreateLiquidityRequestDto } from './dto/create-liquidity-request.dto';
import { LiquidityRequestsService } from './liquidity-requests.service';

@Controller('liquidity-requests')
export class LiquidityRequestsController {
  constructor(
    private readonly liquidityRequestsService: LiquidityRequestsService,
  ) {}

  @Post('check')
  checkRequest(@Body() createLiquidityRequestDto: CreateLiquidityRequestDto) {
    return this.liquidityRequestsService.checkRequest(
      createLiquidityRequestDto,
    );
  }
}
