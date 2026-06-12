import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ResourceType, LearningTrack } from '@prisma/client';

export class ResourceQueryDto {
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @IsOptional()
  @IsEnum(LearningTrack)
  track?: LearningTrack;

  @IsOptional()
  @IsString()
  search?: string;
}
