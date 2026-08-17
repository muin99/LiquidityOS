import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

// This guard checks: "does your role match what @Roles(...) asked for?"
// It always runs AFTER JwtAuthGuard, because it needs request.user to exist.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Step 1: read the list of roles the route said it needs, e.g. [ADMIN]
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Step 2: if the route didn't ask for any specific role, let everyone in
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Step 3: check if the logged-in user's role is in that list
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
