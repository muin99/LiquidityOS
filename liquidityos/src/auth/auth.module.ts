import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwtGuard';
import { JwtStrategy } from './jwtStrategy';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'liquidity-os-secret',
      signOptions: {
        expiresIn: '1H',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, JwtStrategy, RolesGuard],
})
export class AuthModule {}
