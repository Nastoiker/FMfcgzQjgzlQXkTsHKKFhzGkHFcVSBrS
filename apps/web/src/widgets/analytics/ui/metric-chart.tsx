import type { ReactElement } from 'react';

import { labels } from '@/entities/report';
import type { IChartProps } from '@/widgets/analytics/model/chart.interface';
import { ChartBody } from '@/widgets/analytics/ui/chart-body';
import { ChartControls } from '@/widgets/analytics/ui/chart-controls';

export const MetricChart = ({
  days,
  viewer,
  filters,
  update,
  branches,
}: IChartProps): ReactElement => (
  <section className="chart" aria-label={'Динамика: ' + labels[filters.metric]}>
    <div className="chart__settings">
      <h2>Динамика по дням</h2>
      <ChartControls filters={filters} update={update} branches={branches} />

      {!filters.branchId && (
        <p className="chart__hint">Для сравнения выберите первый филиал в фильтре выше.</p>
      )}
      {filters.compareId && (
        <button
          className="chart__reset"
          onClick={() => {
            update({ compareId: '' });
          }}
        >
          Сбросить сравнение
        </button>
      )}
    </div>
    <ChartBody days={days} viewer={viewer} filters={filters} branches={branches} />
  </section>
);
