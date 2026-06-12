import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../common/storage/s3.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, S3Service],
  exports: [ProfileService],
})
export class ProfileModule {}