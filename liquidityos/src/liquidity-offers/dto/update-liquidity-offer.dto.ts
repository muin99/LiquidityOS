import { PartialType } from '@nestjs/mapped-types';
import { CreateLiquidityOfferDto } from './create-liquidity-offer.dto';

export class UpdateLiquidityOfferDto extends PartialType(
  CreateLiquidityOfferDto,
) {}
