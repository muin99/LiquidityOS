import { Module } from '@nestjs/common';
import { CoordinatorsService } from './coordinators.service';
import { CoordinatorsController } from './coordinators.controller';

@Module({
  providers: [CoordinatorsService],
  controllers: [CoordinatorsController],
})
export class CoordinatorsModule {}
