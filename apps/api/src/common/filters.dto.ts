import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Matches, Min } from 'class-validator';

export class Period {
  @IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) from!: string;
  @IsDateString({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) to!: string;
}

export class Filter extends Period {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) company?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) branchId?: number;
}
