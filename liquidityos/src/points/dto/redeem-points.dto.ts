import { IsInt, IsString, Min } from 'class-validator';

export class RedeemPointsDto {
  @IsString()
  catalogItemId: string;

  @IsInt()
  @Min(1)
  points: number;
}
