import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

// This lets us write @Roles(UserRole.ADMIN) on top of a route,
// like putting a sign on a door that says "admins only".
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
