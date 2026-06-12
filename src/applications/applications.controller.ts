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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('create')
  create(@Body() dto: CreateApplicationDto, @Req() req) {
    return this.applicationsService.create(dto, req.user.userId);
  }

  @Get('list')
  findAll(@Req() req) {
    return this.applicationsService.findAll(req.user.userId);
  }

  @Get('stats')
  getStats(@Req() req) {
    return this.applicationsService.getStats(req.user.userId);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.applicationsService.findOne(id, req.user.userId);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @Req() req,
  ) {
    return this.applicationsService.update(id, dto, req.user.userId);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.applicationsService.remove(id, req.user.userId);
  }
}
