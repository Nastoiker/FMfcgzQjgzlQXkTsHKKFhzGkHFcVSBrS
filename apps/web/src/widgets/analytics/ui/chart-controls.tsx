import type { ReactElement } from 'react';

import { branchChoices } from '@/entities/branch';
import { labels, metricKey } from '@/entities/report';
import { Choice } from '@/shared/ui/choice';
import type { IChartProps } from '@/widgets/analytics/model/chart.interface';

export const ChartControls = ({
  filters,
  update,
  branches,
}: Pick<IChartProps, 'filters' | 'update' | 'branches'>): ReactElement => {
  const choices = branchChoices(branches.filter((b) => String(b.id) !== filters.branchId));
  return (
    <div className="chart__controls">
      <Choice
        label="Показатель"
        value={filters.metric}
        options={labels}
        onChange={(key) => {
          update({ metric: metricKey.parse(key) });
        }}
      />
      <Choice
        label="Сравнить с филиалом"
        value={filters.compareId}
        disabled={!filters.branchId && !filters.compareId}
        all="Без сравнения"
        options={choices}
        onChange={(compareId) => {
          update({ compareId });
        }}
      />
    </div>
  );
};
