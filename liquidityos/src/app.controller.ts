import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { Status, PlatformInfo, LiquidityCheckResponse } from './app.service';
import { LiquidityCheckDto } from './dto/liquidity-check.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get("status")
  getStatus(): Status {
    return this.appService.getStatus();
  }
  @Get("platform-info")
  getPlatformInfo(): PlatformInfo {
    return this.appService.getPlatformInfo();
  }

  @Post('liquidity-check')
  liquidCheck(@Body() body: LiquidityCheckDto) : LiquidityCheckResponse {
    return this.appService.liquidityCheck(body);
  }
}
