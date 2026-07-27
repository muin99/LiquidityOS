import { IsEnum, IsString, Length } from 'class-validator';

export class ResolveDisputeDto {
  @IsEnum(['resolved', 'rejected'])
  resolutionType: 'resolved' | 'rejected';

  @IsString()
  @Length(2, 2000)
  note: string;
}
