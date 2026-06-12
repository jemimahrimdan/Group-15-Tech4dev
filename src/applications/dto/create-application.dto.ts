import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { OpportunityType, ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsEnum(OpportunityType)
  type: OpportunityType;

  @IsOptional()
  @IsDateString()
  dateApplied?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  linkedOpportunityId?: string;
}
