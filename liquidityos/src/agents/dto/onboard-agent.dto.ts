import { IsString, IsUUID, Length } from 'class-validator';

export class OnboardAgentDto {
  @IsUUID()
  userId: string;
  @IsUUID()
  providerId: string;
  @IsUUID()
  areaId: string;
  @IsString()
  @Length(2, 150)
  shopName: string;
  @IsString()
  @Length(5, 255)
  address: string;
}
