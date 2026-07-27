import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsModule } from './agents/agents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreasModule } from './areas/areas.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuthModule } from './auth/auth.module';
import { CoordinatorsModule } from './coordinators/coordinators.module';
import { DisputesModule } from './disputes/disputes.module';
import { LiquidityOffersModule } from './liquidity-offers/liquidity-offers.module';
import { LiquidityRequestsModule } from './liquidity-requests/liquidity-requests.module';
import { LiquidityTransfersModule } from './liquidity-transfers/liquidity-transfers.module';
import { MailerModule } from './mailer/mailer.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PointsModule } from './points/points.module';
import { ProvidersModule } from './providers/providers.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: 'postgres',
      password: 'admin',
      port: 5432,
      database: 'liquidityos',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ProvidersModule,
    AreasModule,
    AgentsModule,
    CoordinatorsModule,
    WalletsModule,
    LiquidityRequestsModule,
    LiquidityOffersModule,
    LiquidityTransfersModule,
    PointsModule,
    NotificationsModule,
    MailerModule,
    DisputesModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
