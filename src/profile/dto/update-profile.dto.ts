import { IsOptional, IsString, IsArray, IsEnum, MaxLength, ArrayMaxSize } from 'class-validator';
import { LearningTrack } from '@prisma/client';

export class UpdateProfileDto {
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
  learningTrack?: any;

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
}