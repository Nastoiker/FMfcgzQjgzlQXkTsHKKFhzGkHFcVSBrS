import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { db } from '@/common/database';
import type { Period } from '@/common/filters.dto';
import type { IGroupedDay } from '@/common/metrics.interface';
import { chartDays } from '@/modules/metrics/metrics.lib';

/** TASK.md §2. Объединение рядов не умножает метрики на число отзывов. */
export const reportSql = (
  ids: Prisma.Sql,
  period: Pick<Period, 'from' | 'to'>,
  branchBreakdown = false,
): Prisma.Sql => {
  const branchColumn = branchBreakdown ? Prisma.sql`branch_id` : Prisma.sql`NULL::int AS branch_id`;
  const groups = branchBreakdown
    ? Prisma.sql`GROUPING SETS ((), (date), (branch_id))`
    : Prisma.sql`ROLLUP(date)`;
  return Prisma.sql`
    WITH allowed AS (${ids}), facts AS (
      SELECT branch_id, date, views, site, calls, routes, NULL::integer AS rating
      FROM daily_metrics WHERE branch_id IN (SELECT id FROM allowed) AND date BETWEEN ${period.from}::date AND ${period.to}::date
      UNION ALL
      SELECT branch_id, created_at::date, 0, 0, 0, 0, rating
      FROM reviews WHERE branch_id IN (SELECT id FROM allowed) AND created_at >= ${period.from}::date AND created_at < ${period.to}::date + 1
    )
    SELECT ${branchColumn}, date::text, COALESCE(SUM(views),0)::float8 views, COALESCE(SUM(site),0)::float8 site,
      COALESCE(SUM(calls),0)::float8 calls, COALESCE(SUM(routes),0)::float8 routes,
      ROUND(AVG(rating),1)::float8 rating, COUNT(rating)::float8 reviews
    FROM facts GROUP BY ${groups}`;
};

const totals = (row?: IGroupedDay) => ({
  views: row?.views ?? 0,
  site: row?.site ?? 0,
  calls: row?.calls ?? 0,
  routes: row?.routes ?? 0,
  rating: row?.rating ?? null,
  reviews: row?.reviews ?? 0,
});
@Injectable()
export class MetricsRepository {
  async report(ids: Prisma.Sql, period: Pick<Period, 'from' | 'to'>, branchBreakdown = false) {
    const rows = await db.$queryRaw<IGroupedDay[]>(reportSql(ids, period, branchBreakdown));
    const total = rows.find((row) => row.date === null && row.branch_id === null);
    return {
      metrics: totals(total),
      days: chartDays(
        rows.flatMap((row) => (row.date === null ? [] : [{ date: row.date, ...totals(row) }])),
      ),
      branches: rows
        .flatMap((row) =>
          row.branch_id === null ? [] : [{ branchId: row.branch_id, ...totals(row) }],
        )
        .sort((a, b) => a.branchId - b.branchId),
    };
  }
}
