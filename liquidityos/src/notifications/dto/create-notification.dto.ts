import { IsObject, IsString, IsUUID, Length } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(2, 50)
  type: string;

  @IsObject()
  payload: Record<string, unknown>;
}
