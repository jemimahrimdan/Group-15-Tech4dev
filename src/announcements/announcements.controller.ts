import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Post('create')
  create(@Body() dto: CreateAnnouncementDto, @Req() req) {
    return this.announcementsService.create(dto, req.user.userId);
  }

  @Public()
  @Get('list')
  findAll() {
    return this.announcementsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
    @Req() req,
  ) {
    return this.announcementsService.update(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.announcementsService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Patch('toggle-pin/:id')
  togglePin(@Param('id') id: string, @Req() req) {
    return this.announcementsService.togglePin(id, req.user.userId);
  }
}
