import { Module } from '@nestjs/common';

import { BranchesModule } from '@/modules/branches/branches.module';
import { ExportController, MetricsController } from '@/modules/metrics/metrics.controller';
import { MetricsRepository } from '@/modules/metrics/metrics.repository';
import { MetricsService } from '@/modules/metrics/metrics.service';

@Module({
  imports: [BranchesModule],
  controllers: [MetricsController, ExportController],
  providers: [MetricsRepository, MetricsService],
})
export class MetricsModule {}
