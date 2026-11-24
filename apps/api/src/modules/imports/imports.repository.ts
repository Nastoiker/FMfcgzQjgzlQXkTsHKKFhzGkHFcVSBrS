import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { db } from '@/common/database';
import type { IMetric } from '@/common/metrics.interface';
import { ImportPeriod } from '@/modules/imports/dto/imports.dto';

@Injectable()
export class ImportsRepository {
  start(period: ImportPeriod) {
    return db.importRun.create({
      data: {
        branch_id: period.branchId,
        date_from: new Date(period.from),
        date_to: new Date(period.to),
        status: 'running',
      },
    });
  }
  /** TASK.md §5. При откате снимков должна откатиться и отметка об успешном импорте. */
  async finish(id: number, rows: IMetric[], attempts: number) {
    await db.$transaction(async (tx) => {
      if (rows.length) {
        const values = rows.map(
          (row) =>
            Prisma.sql`(${row.branch_id},${row.date}::date,${row.views},${row.site},${row.calls},${row.routes})`,
        );
        await tx.$executeRaw`insert into daily_metrics(branch_id,date,views,site,calls,routes) values ${Prisma.join(values)} ON CONFLICT (branch_id,date) DO UPDATE SET views=excluded.views,site=excluded.site,calls=excluded.calls,routes=excluded.routes`;
      }
      await tx.importRun.update({
        where: { id },
        data: { status: 'success', rows: rows.length, attempts },
      });
    });
  }
  async fail(id: number, error: string, attempts: number) {
    await db.importRun.update({ where: { id }, data: { status: 'failed', error, attempts } });
  }
}
