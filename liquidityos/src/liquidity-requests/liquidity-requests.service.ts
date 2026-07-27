import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLiquidityRequestDto } from './dto/create-liquidity-request.dto';

@Injectable()
export class LiquidityRequestsService {
  checkRequest(createLiquidityRequestDto: CreateLiquidityRequestDto) {
    if (new Date(createLiquidityRequestDto.expiresAt) <= new Date()) {
      throw new BadRequestException('Expiry date must be in the future');
    }

    return {
      message: 'Liquidity request data is valid',
      data: createLiquidityRequestDto,
    };
  }
}
