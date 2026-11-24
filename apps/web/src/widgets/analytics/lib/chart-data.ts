import type { TMetric, TReport } from '@/entities/report';
import type { IChartPoint } from '@/widgets/analytics/model/chart.interface';

export const alignDays = (
  primary: TReport['days'],
  secondary: TReport['days'],
  metric: TMetric,
): IChartPoint[] => {
  const first = new Map(primary.map((day) => [day.date, day[metric]]));
  const second = new Map(secondary.map((day) => [day.date, day[metric]]));
  return [...new Set([...first.keys(), ...second.keys()])].sort().map((date) => ({
    date,
    primary: first.get(date) ?? null,
    secondary: second.get(date) ?? null,
  }));
};
