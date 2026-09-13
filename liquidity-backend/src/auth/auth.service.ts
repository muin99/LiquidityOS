import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Step 1 of the flow: sign up. Account is created but NOT active yet —
  // an admin has to approve it before this person can log in.
  async register(dto: RegisterDto) {
    // A provider account has to say which provider it represents.
    if (dto.role === UserRole.PROVIDER && !dto.providerId) {
      throw new BadRequestException(
        'providerId is required when registering as a provider',
      );
    }

    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      role: dto.role,
      areaId: dto.areaId,
      providerId: dto.providerId,
    });

    return {
      message: 'Registered! Please wait for an admin to approve your account.',
      userId: user.id,
    };
  }

  // Step 2 of the flow: log in and get a token back.
  async login(dto: LoginDto) {
    // 1. find the account by email or phone
    const user = await this.usersService.findByEmailOrPhone(dto.login);
    if (!user) {
      throw new UnauthorizedException('Wrong email/phone or password');
    }

    // 2. check the password matches the stored (hashed) one
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Wrong email/phone or password');
    }

    // 3. block anyone whose account isn't approved/active yet
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        `Your account is "${user.status}" — an admin needs to approve it first`,
      );
    }

    // 4. everything checks out — hand back a signed token
    // providerId only matters for a provider account, but it's harmless
    // to include as undefined for everyone else.
    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      providerId: user.providerId,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        providerId: user.providerId,
      },
    };
  }

  // Step 3 (optional): whoever is holding this token, who are they?
  // The frontend uses this on page load to check "is my saved login
  // still good", without making the person type their password again.
  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      areaId: user.areaId,
      providerId: user.providerId,
    };
  }
}
