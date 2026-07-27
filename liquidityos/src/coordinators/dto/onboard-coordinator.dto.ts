import { IsString, IsUUID, Length } from 'class-validator';

export class OnboardCoordinatorDto {
  @IsUUID()
  userId: string;
  @IsUUID()
  areaId: string;
  @IsString()
  @Length(2, 150)
  name: string;
}
