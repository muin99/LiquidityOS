import { PartialType } from '@nestjs/mapped-types';
import { OnboardAgentDto } from './onboard-agent.dto';

export class UpdateAgentDto extends PartialType(OnboardAgentDto) {}
