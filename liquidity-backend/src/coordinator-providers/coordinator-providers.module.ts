import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinatorProvider } from './coordinator-provider.entity';
import { CoordinatorProvidersService } from './coordinator-providers.service';
import { CoordinatorProvidersController } from './coordinator-providers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CoordinatorProvider])],
  controllers: [CoordinatorProvidersController],
  providers: [CoordinatorProvidersService],
})
export class CoordinatorProvidersModule {}
