import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceQueryDto } from './dto/resource-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateResourceDto, userId: string) {
    const resource = await this.prisma.resource.create({
      data: {
        ...dto,
        postedById: userId,
      },
    });

    return { message: 'Resource posted successfully', data: resource };
  }

  async findAll(query: ResourceQueryDto) {
    const where: Prisma.ResourceWhereInput = {};

    if (query.type) where.type = query.type;
    if (query.track) where.track = query.track;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const resources = await this.prisma.resource.findMany({
      where,
      orderBy: { upvoteCount: 'desc' },
      include: {
        postedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return { data: resources };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return { data: resource };
  }

  async update(id: string, dto: UpdateResourceDto, userId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.postedById !== userId) {
      throw new ForbiddenException('You can only edit your own resources');
    }

    const updated = await this.prisma.resource.update({
      where: { id },
      data: dto,
    });

    return { message: 'Resource updated successfully', data: updated };
  }

  async remove(id: string, userId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.postedById !== userId) {
      throw new ForbiddenException('You can only delete your own resources');
    }

    await this.prisma.resource.delete({ where: { id } });

    return { message: 'Resource deleted successfully' };
  }

  async toggleUpvote(resourceId: string, userId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const existing = await this.prisma.upvote.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.upvote.delete({
          where: { userId_resourceId: { userId, resourceId } },
        }),
        this.prisma.resource.update({
          where: { id: resourceId },
          data: { upvoteCount: { decrement: 1 } },
        }),
      ]);

      return { message: 'Upvote removed' };
    }

    await this.prisma.$transaction([
      this.prisma.upvote.create({
        data: { userId, resourceId },
      }),
      this.prisma.resource.update({
        where: { id: resourceId },
        data: { upvoteCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Resource upvoted' };
  }
}
