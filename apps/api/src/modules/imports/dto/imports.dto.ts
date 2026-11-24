import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { Period } from '@/common/filters.dto';

export class ImportPeriod extends Period {
  @Type(() => Number) @IsInt() @Min(1) branchId!: number;
}
