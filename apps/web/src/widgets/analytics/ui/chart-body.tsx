import type { ReactElement } from 'react';

import { branchLabel } from '@/entities/branch';
import { useDashboard } from '@/entities/report';
import { queryFor } from '@/features/report-filters';
import { ReportState } from '@/shared/ui/report-state';
import { alignDays } from '@/widgets/analytics/lib/chart-data';
import type { IChartProps } from '@/widgets/analytics/model/chart.interface';
import { ChartSeries } from '@/widgets/analytics/ui/chart-series';

export const ChartBody = ({
  days,
  viewer,
  filters,
  branches,
}: Omit<IChartProps, 'update'>): ReactElement => {
  const enabled = Boolean(
    filters.branchId && filters.compareId && filters.compareId !== filters.branchId,
  );
  const range = queryFor({ ...filters, branchId: filters.compareId });
  const other = useDashboard(viewer, range, enabled);
  if (filters.compareId && !enabled)
    return <ReportState state="empty" message="Для сравнения выберите два разных филиала." />;
  if (enabled && other.isError)
    return (
      <ReportState state="error" message={other.error.message} retry={() => void other.refetch()} />
    );
  if (enabled && other.isPending)
    return <ReportState state="pending" shape="chart" message="Загрузка сравнения…" />;
  const secondary = enabled ? (other.data?.days ?? []) : [];
  const points = alignDays(days, secondary, filters.metric);
  if (!points.some((p) => p.primary !== null || p.secondary !== null))
    return (
      <ReportState
        state="empty"
        message={points.length ? 'За этот период нет оценок' : undefined}
      />
    );
  const names = new Map(branches.map((b) => [String(b.id), branchLabel(b)]));
  return (
    <ChartSeries
      points={points}
      primary={names.get(filters.branchId) ?? 'Все доступные филиалы'}
      secondary={enabled ? names.get(filters.compareId) : undefined}
      metric={filters.metric}
    />
  );
};
