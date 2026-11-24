import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { Filter } from '@/common/filters.dto';
import { Actor } from '@/common/session.decorator';
import type { TUser } from '@/modules/auth/identity';
import { MetricsService } from '@/modules/metrics/metrics.service';

@Controller('dashboard')
export class MetricsController {
  constructor(private readonly service: MetricsService) {}
  @Get() get(@Actor() viewer: TUser, @Query() filters: Filter) {
    return this.service.dashboard(viewer, filters);
  }
}

@Controller('export')
export class ExportController {
  constructor(private readonly service: MetricsService) {}
  @Get() async csv(
    @Actor() viewer: TUser,
    @Query() filters: Filter,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.service.csv(viewer, filters);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="statistics.csv"');
    return csv;
  }
}
