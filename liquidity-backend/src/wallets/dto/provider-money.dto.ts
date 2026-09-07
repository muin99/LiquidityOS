import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { RequestType } from '../../common/enums/request-type.enum';

export class ProviderMoneyDto {
  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  type: RequestType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class ProviderSupplyDto extends ProviderMoneyDto {
  @ApiProperty()
  @IsString()
  coordinatorId: string;
}
