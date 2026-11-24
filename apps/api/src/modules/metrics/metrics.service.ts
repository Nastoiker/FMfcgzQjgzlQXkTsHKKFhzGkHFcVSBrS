import { Injectable } from '@nestjs/common';

import { Filter } from '@/common/filters.dto';
import type { TUser } from '@/modules/auth/identity';
import { Selection } from '@/modules/branches/selection.service';
import { previousPeriod } from '@/modules/metrics/metrics.lib';
import { MetricsRepository } from '@/modules/metrics/metrics.repository';

@Injectable()
export class MetricsService {
  constructor(
    private readonly selection: Selection,
    private readonly repo: MetricsRepository,
  ) {}
  async csv(viewer: TUser, filters: Filter) {
    const ids = await this.selection.ids(viewer, filters);
    const { days } = await this.repo.report(ids, filters);
    const header =
      'Дата,Просмотры карточек,Переходы на сайт,Звонки,Построенные маршруты,Средний рейтинг,Отзывы';
    const rows = days.map((d) =>
      [d.date, d.views, d.site, d.calls, d.routes, d.rating, d.reviews].join(','),
    );
    return '\uFEFF' + [header, ...rows].join('\r\n') + '\r\n';
  }
  async dashboard(viewer: TUser, filters: Filter) {
    const ids = await this.selection.ids(viewer, filters);
    const [now, before] = await Promise.all([
      this.repo.report(ids, filters, true),
      this.repo.report(ids, previousPeriod(filters.from, filters.to)),
    ]);
    return { ...now, previous: before.metrics };
  }
}
