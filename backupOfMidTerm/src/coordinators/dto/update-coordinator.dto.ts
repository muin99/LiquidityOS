import { PartialType } from '@nestjs/mapped-types';
import { OnboardCoordinatorDto } from './onboard-coordinator.dto';

export class UpdateCoordinatorDto extends PartialType(OnboardCoordinatorDto) {}
