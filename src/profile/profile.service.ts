import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
  const existing = await this.prisma.profile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new BadRequestException('Profile already exists');
  }

  const profile = await this.prisma.profile.create({
    data: {
      userId,
      ...dto,
    },
  });

  return {
    ...profile,
    completion: this.calculateCompletion(profile),
  };
}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

  return {
    ...profile,
    completion: this.calculateCompletion(profile),
  };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
  if (dto.skills && dto.skills.length > 15) {
    throw new BadRequestException('Max 15 skills allowed');
  }

  const profile = await this.prisma.profile.update({
    where: { userId },
    data: {
      ...dto,
    },
  });

  return {
    ...profile,
    completion: this.calculateCompletion(profile),
  };
}

  async updateAvatar(userId: string, url: string) {
  return this.prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      avatar: url,
    },
    update: {
      avatar: url,
    },
  });
}

private calculateCompletion(profile: any): number {
  let score = 0;

  if (profile.name) score += 10;
  if (profile.bio) score += 10;
  if (profile.avatar) score += 15;
  if (profile.location) score += 10;
  if (profile.learningTrack) score += 10;

  if (profile.skills?.length > 0) {
    // max 20 points scaled
    const skillScore = Math.min(profile.skills.length, 15);
    score += (skillScore / 15) * 20;
  }

  if (profile.goals) score += 10;

  const socials =
    (profile.linkedin ? 1 : 0) +
    (profile.github ? 1 : 0) +
    (profile.twitter ? 1 : 0) +
    (profile.website ? 1 : 0);

  score += (socials / 4) * 15;

  return Math.round(score);
}
}