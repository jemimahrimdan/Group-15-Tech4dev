import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, userId: string) {
    const application = await this.prisma.application.create({
      data: {
        company: dto.company,
        role: dto.role,
        type: dto.type,
        dateApplied: dto.dateApplied ? new Date(dto.dateApplied) : new Date(),
        status: dto.status ?? ApplicationStatus.APPLIED,
        notes: dto.notes,
        linkedOpportunityId: dto.linkedOpportunityId,
        userId,
      },
    });

    return { message: 'Application logged successfully', data: application };
  }

  async findAll(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        linkedOpportunity: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    return { data: applications };
  }

  async getStats(userId: string) {
    const [total, active, interviewing, offers, rejected] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.count({
        where: {
          userId,
          status: {
            in: [ApplicationStatus.APPLIED, ApplicationStatus.IN_REVIEW],
          },
        },
      }),
      this.prisma.application.count({
        where: { userId, status: ApplicationStatus.INTERVIEWING },
      }),
      this.prisma.application.count({
        where: { userId, status: ApplicationStatus.OFFER_RECEIVED },
      }),
      this.prisma.application.count({
        where: { userId, status: ApplicationStatus.REJECTED },
      }),
    ]);

    return {
      data: {
        total,
        active,
        interviewing,
        offers,
        rejected,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        linkedOpportunity: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You can only view your own applications');
    }

    return { data: application };
  }

  async update(id: string, dto: UpdateApplicationDto, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You can only update your own applications');
    }

    const updateData: any = { ...dto };
    if (dto.dateApplied) {
      updateData.dateApplied = new Date(dto.dateApplied);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: updateData,
    });

    return { message: 'Application updated successfully', data: updated };
  }

  async remove(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You can only delete your own applications');
    }

    await this.prisma.application.delete({ where: { id } });

    return { message: 'Application deleted successfully' };
  }
}
