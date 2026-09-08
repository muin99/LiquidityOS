import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { RequestType } from '../../common/enums/request-type.enum';

export class CreateProviderSupplyRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  type: RequestType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
