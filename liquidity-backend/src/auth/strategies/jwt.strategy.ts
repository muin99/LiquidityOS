import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// This runs on every request that has "Authorization: Bearer <token>".
// It opens the token, checks it's really ours (not faked), and reads
// what's inside it. Whatever we "return" here becomes "request.user".
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: { sub: string; role: string; providerId?: string }) {
    // "payload" is exactly what we put inside the token when we logged the user in.
    return { id: payload.sub, role: payload.role, providerId: payload.providerId };
  }
}
