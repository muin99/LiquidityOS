import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '../../common/enums/user-status.enum';

// This runs on every request that has "Authorization: Bearer <token>".
// It opens the token, checks it's really ours (not faked), and reads
// what's inside it. Whatever we "return" here becomes "request.user".
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { sub: string; role: string; providerId?: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active');
    }

    return { id: user.id, role: user.role, providerId: user.providerId };
  }
}
