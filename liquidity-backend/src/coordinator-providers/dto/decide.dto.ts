import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class DecideApplicationDto {
  // Only "approved" or "rejected" make sense as a decision.
  @ApiProperty({ enum: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] })
  @IsEnum([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED])
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
}
