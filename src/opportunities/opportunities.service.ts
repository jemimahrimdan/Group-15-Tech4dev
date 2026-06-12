import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityQueryDto } from './dto/opportunity-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOpportunityDto, userId: string) {
    const opportunity = await this.prisma.opportunity.create({
      data: {
        ...dto,
        deadline: new Date(dto.deadline),
        postedById: userId,
      },
    });

    return { message: 'Opportunity posted successfully', data: opportunity };
  }

  async findAll(query: OpportunityQueryDto) {
    const where: Prisma.OpportunityWhereInput = {};

    if (query.type) where.type = query.type;
    if (query.location)
      where.location = { contains: query.location, mode: 'insensitive' };
    if (query.track) where.track = query.track;
    if (query.isClosed !== undefined) where.isClosed = query.isClosed;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const opportunities = await this.prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    return { data: opportunities };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return { data: opportunity };
  }

  async update(id: string, dto: UpdateOpportunityDto, userId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.postedById !== userId) {
      throw new ForbiddenException('You can only edit your own opportunities');
    }

    const updateData: any = { ...dto };
    if (dto.deadline) {
      updateData.deadline = new Date(dto.deadline);
    }

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: updateData,
    });

    return { message: 'Opportunity updated successfully', data: updated };
  }

  async remove(id: string, userId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.postedById !== userId) {
      throw new ForbiddenException(
        'You can only delete your own opportunities',
      );
    }

    await this.prisma.opportunity.delete({ where: { id } });

    return { message: 'Opportunity deleted successfully' };
  }

  async bookmark(opportunityId: string, userId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_opportunityId: { userId, opportunityId } },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: { userId_opportunityId: { userId, opportunityId } },
      });
      return { message: 'Bookmark removed' };
    }

    await this.prisma.bookmark.create({
      data: { userId, opportunityId },
    });

    return { message: 'Opportunity bookmarked' };
  }

  async getBookmarked(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        opportunity: {
          include: {
            postedBy: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: bookmarks.map((b) => b.opportunity) };
  }
}
