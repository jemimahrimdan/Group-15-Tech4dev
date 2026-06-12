import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { OpportunityType, LearningTrack } from '@prisma/client';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsEnum(OpportunityType)
  type: OpportunityType;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(LearningTrack)
  track: LearningTrack;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}
