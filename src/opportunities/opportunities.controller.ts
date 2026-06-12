import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityQueryDto } from './dto/opportunity-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Post('create')
  create(@Body() dto: CreateOpportunityDto, @Req() req) {
    return this.opportunitiesService.create(dto, req.user.userId);
  }

  @Public()
  @Get('list')
  findAll(@Query() query: OpportunityQueryDto) {
    return this.opportunitiesService.findAll(query);
  }

  @Public()
  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
    @Req() req,
  ) {
    return this.opportunitiesService.update(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.opportunitiesService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bookmark/:id')
  bookmark(@Param('id') id: string, @Req() req) {
    return this.opportunitiesService.bookmark(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarked/list')
  getBookmarked(@Req() req) {
    return this.opportunitiesService.getBookmarked(req.user.userId);
  }
}
