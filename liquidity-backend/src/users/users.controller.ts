import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// Only an admin can see or approve pending registrations.
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /users/pending -> everyone waiting for admin approval
  @Get('pending')
  listPending() {
    return this.usersService.listPending();
  }

  // GET /users -> every account, so admin can oversee the whole platform.
  @Get()
  listAll() {
    return this.usersService.listAll();
  }

  // PATCH /users/:id/approve -> flip that one user to "active"
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.usersService.approve(id);
  }

  // PATCH /users/:id/restrict -> make an active account pending again.
  @Patch(':id/restrict')
  restrict(@Param('id') id: string, @CurrentUser() admin: { id: string }) {
    return this.usersService.restrict(id, admin.id);
  }

  // DELETE /users/:id -> remove an account from the platform.
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() admin: { id: string }) {
    return this.usersService.remove(id, admin.id);
  }
}
