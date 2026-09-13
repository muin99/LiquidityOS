import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // Find a user by email OR phone — used when logging in.
  async findByEmailOrPhone(login: string) {
    return this.usersRepo.findOne({
      where: [{ email: login }, { phone: login }],
    });
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Create a brand new user. They start "pending" until an admin approves them.
  async create(data: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    role: UserRole;
    areaId?: string;
    providerId?: string;
  }) {
    const existing = data.email
      ? await this.usersRepo.findOne({ where: { email: data.email } })
      : await this.usersRepo.findOne({ where: { phone: data.phone } });

    if (existing) {
      throw new ConflictException('An account with this email/phone already exists');
    }

    // Turn the plain password into a scrambled hash. We NEVER store the real password.
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
      areaId: data.areaId,
      providerId: data.providerId,
      status: UserStatus.PENDING,
    });

    return this.usersRepo.save(user);
  }

  async listPending() {
    return this.usersRepo.find({
      where: { status: UserStatus.PENDING },
      relations: ['area', 'provider'],
    });
  }

  // Admin's full people list: agents, coordinators, providers, and admins.
  listAll() {
    return this.usersRepo.find({
      relations: ['area', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }

  // Admin-only action: turn a pending account into an active one.
  async approve(id: string) {
    const user = await this.findById(id);
    user.status = UserStatus.ACTIVE;
    return this.usersRepo.save(user);
  }

  // Restricting an account sends it back to the same pending state as a new signup.
  async restrict(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('You cannot restrict your own account');
    }

    const user = await this.findById(id);
    user.status = UserStatus.PENDING;
    return this.usersRepo.save(user);
  }

  // An admin can remove an account that is no longer part of the platform.
  async remove(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.findById(id);
    await this.usersRepo.remove(user);
    return { message: 'User deleted' };
  }
}
