import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentProvider } from './agent-provider.entity';
import { AgentProvidersService } from './agent-providers.service';
import { AgentProvidersController } from './agent-providers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentProvider])],
  controllers: [AgentProvidersController],
  providers: [AgentProvidersService],
  exports: [AgentProvidersService],
})
export class AgentProvidersModule {}
