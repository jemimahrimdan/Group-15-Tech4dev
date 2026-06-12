import { IsOptional, IsEnum, IsString } from 'class-validator';
import { OpportunityType, LearningTrack } from '@prisma/client';
import { Transform } from 'class-transformer';

export class OpportunityQueryDto {
  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(LearningTrack)
  track?: LearningTrack;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isClosed?: boolean;
}
