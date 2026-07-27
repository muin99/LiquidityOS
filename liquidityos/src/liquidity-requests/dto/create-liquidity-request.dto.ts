import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import {
  LiquidityType,
  OwnerType,
  Urgency,
} from '../../common/enums/domain.enums';

export class CreateLiquidityRequestDto {
  @IsUUID()
  requesterId: string;
  @IsEnum(OwnerType)
  requesterType: OwnerType;
  @IsEnum(LiquidityType)
  liquidityType: LiquidityType;
  @IsUUID()
  providerId: string;
  @IsUUID()
  areaId: string;
  @IsInt()
  @Min(1)
  amount: number;
  @IsEnum(Urgency)
  urgency: Urgency;
  @IsOptional()
  @IsBoolean()
  allowPartial?: boolean;
  @IsDateString()
  expiresAt: string;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
