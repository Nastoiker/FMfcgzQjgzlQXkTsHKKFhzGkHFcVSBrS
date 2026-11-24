import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { SessionGuard } from '@/common/session.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { BranchesModule } from '@/modules/branches/branches.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { ImportsModule } from '@/modules/imports/imports.module';
import { MetricsModule } from '@/modules/metrics/metrics.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';

@Module({
  imports: [
    AuthModule,
    BranchesModule,
    CompaniesModule,
    MetricsModule,
    ReviewsModule,
    ImportsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: SessionGuard }],
})
export class AppModule {}
