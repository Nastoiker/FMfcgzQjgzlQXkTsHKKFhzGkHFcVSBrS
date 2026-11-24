import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

import { Filter } from '@/common/filters.dto';

export type TReviewStatus = 'new' | 'in_progress' | 'resolved';

const statuses: TReviewStatus[] = ['new', 'in_progress', 'resolved'];

export class ReviewFilters extends Filter {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsIn(statuses) status?: TReviewStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(2147483647) cursor?: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class ReviewChange {
  @IsIn(statuses) status!: TReviewStatus;
}
