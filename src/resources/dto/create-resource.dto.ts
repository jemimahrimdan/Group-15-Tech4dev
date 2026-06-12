import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ResourceType, LearningTrack } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsEnum(LearningTrack)
  track: LearningTrack;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  source?: string;
}
