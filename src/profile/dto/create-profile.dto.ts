import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { LearningTrack, ExperienceLevel } from '@prisma/client';

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(LearningTrack)
  learningTrack?: LearningTrack;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  goals?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;
}