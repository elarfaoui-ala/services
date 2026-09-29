import { IsOptional, IsIn, IsDateString } from 'class-validator';
import { DateRange } from '@dashboard-module/shared';

const VALID_RANGES: DateRange[] = ['today', '7d', '30d', '90d', 'custom'];

export class DashboardQueryDto {
  @IsOptional()
  @IsIn(VALID_RANGES)
  range?: DateRange;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
