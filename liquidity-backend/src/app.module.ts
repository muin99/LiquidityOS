import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AreasModule } from './areas/areas.module';
import { ProvidersModule } from './providers/providers.module';
import { WalletsModule } from './wallets/wallets.module';
import { CoordinatorProvidersModule } from './coordinator-providers/coordinator-providers.module';
import { EcashRequestsModule } from './ecash-requests/ecash-requests.module';
import { AgentProvidersModule } from './agent-providers/agent-providers.module';
import { ProviderSupplyRequestsModule } from './provider-supply-requests/provider-supply-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        // Handy while learning — Postgres updates its tables to match our
        // entities automatically. Turn this off once there's real data,
        // and use migrations instead.
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    AreasModule,
    ProvidersModule,
    WalletsModule,
    CoordinatorProvidersModule,
    EcashRequestsModule,
    AgentProvidersModule,
    ProviderSupplyRequestsModule,
  ],
})
export class AppModule {}
