import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAnnouncementDto, userId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        ...dto,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            profile: { select: { avatar: true } },
          },
        },
      },
    });

    return { message: 'Announcement posted successfully', data: announcement };
  }

  async findAll() {
    const announcements = await this.prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            profile: { select: { avatar: true } },
          },
        },
      },
    });

    return { data: announcements };
  }

  async update(id: string, dto: UpdateAnnouncementDto, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own announcements');
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: { ...dto, isEdited: true },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            profile: { select: { avatar: true } },
          },
        },
      },
    });

    return { message: 'Announcement updated successfully', data: updated };
  }

  async remove(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.authorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own announcements',
      );
    }

    await this.prisma.announcement.delete({ where: { id } });

    return { message: 'Announcement deleted successfully' };
  }

  async togglePin(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.authorId !== userId) {
      throw new ForbiddenException('You can only pin your own announcements');
    }

    if (!announcement.isPinned) {
      const pinnedCount = await this.prisma.announcement.count({
        where: { authorId: userId, isPinned: true },
      });

      if (pinnedCount >= 2) {
        throw new BadRequestException('Maximum 2 pinned announcements allowed');
      }
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: { isPinned: !announcement.isPinned },
    });

    return {
      message: updated.isPinned
        ? 'Announcement pinned'
        : 'Announcement unpinned',
      data: updated,
    };
  }
}
