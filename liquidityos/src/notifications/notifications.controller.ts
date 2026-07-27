import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}
  @Post() @Roles(UserRole.ADMIN) create(@Body() dto: CreateNotificationDto) {
    return this.notifications.create(dto);
  }
  @Get() findAll(
    @Req() req: { user: { id: string } },
    @Query('status') status?: string,
  ) {
    return this.notifications.findAll(req.user.id, status);
  }
  @Patch(':id/read') read(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.notifications.read(id, req.user.id);
  }
  @Post('read-all') readAll(@Req() req: { user: { id: string } }) {
    return this.notifications.readAll(req.user.id);
  }
}
