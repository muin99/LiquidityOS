import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { OpenDisputeDto } from './dto/open-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputesService } from './disputes.service';
import { Req } from '@nestjs/common';
@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}
  @Post() open(
    @Body() dto: OpenDisputeDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.disputes.open(dto, req.user.id);
  }
  @Get() @Roles(UserRole.ADMIN) findAll() {
    return this.disputes.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.disputes.findOne(id);
  }
  @Post(':id/resolve') @Roles(UserRole.ADMIN) resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputes.resolve(id, dto);
  }
}
