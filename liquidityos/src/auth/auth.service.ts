import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { UserRole } from '../users/enums/user-role.enum';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    const [emailUser, phoneUser] = await Promise.all([
      this.usersService.findByEmail(dto.email),
      dto.phone ? this.usersService.findByPhone(dto.phone) : null,
    ]);
    const existingUser = emailUser ?? phoneUser;

    if (existingUser) {
      throw new ConflictException('Email or phone already exists');
    }

    if (dto.role === UserRole.PROVIDER) {
      const existingProvider = await this.dataSource
        .getRepository(Provider)
        .findOneBy({ tenant_code: dto.tenantCode });
      if (existingProvider) {
        throw new ConflictException('Provider tenant code already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { user, provider } = await this.dataSource.transaction(
      async (manager) => {
        const users = manager.getRepository(User);
        const providers = manager.getRepository(Provider);
        const user = await users.save(
          users.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: dto.role,
          }),
        );

        if (dto.role !== UserRole.PROVIDER) return { user, provider: null };

        const provider = await providers.save(
          providers.create({
            name: dto.providerName!,
            tenant_code: dto.tenantCode!,
            ownerUserId: user.id,
            contact_name: dto.contactName,
            contact_email: dto.contactEmail ?? dto.email,
            contact_phone: dto.contactPhone ?? dto.phone,
          }),
        );
        user.providerId = provider.id;
        await users.save(user);
        return { user, provider };
      },
    );

    // Return response
    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerId: user.providerId,
      },
      ...(provider && { provider }),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerId: user.providerId,
      },
    };
  }
}
