import { IsString, Length, Matches } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @Length(2, 150)
  name: string;
  @Matches(/^[A-Z0-9_-]{2,30}$/)
  tenantCode: string;
}
