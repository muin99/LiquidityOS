import { PartialType } from '@nestjs/mapped-types';
import { CreateLiquidityRequestDto } from './create-liquidity-request.dto';

export class UpdateLiquidityRequestDto extends PartialType(
  CreateLiquidityRequestDto,
) {}
