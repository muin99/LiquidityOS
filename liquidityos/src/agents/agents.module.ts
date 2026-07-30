import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { AreasModule } from '../areas/areas.module';
import { ProvidersModule } from '../providers/providers.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent]),
    UsersModule,
    ProvidersModule,
    AreasModule,
  ],
  providers: [AgentsService],
  controllers: [AgentsController],
})
export class AgentsModule {}
