import type { TBranch } from '@/entities/branch';
import type { TMetric, TReport } from '@/entities/report';
import type { TViewer } from '@/entities/session';
import type { IReportFilters, TUpdateFilters } from '@/features/report-filters';

export interface IChartPoint {
  date: string;
  primary: number | null;
  secondary: number | null;
}

export interface IChartProps {
  days: TReport['days'];
  viewer: TViewer;
  filters: IReportFilters;
  update: TUpdateFilters;
  branches: TBranch[];
}

export interface ISeriesProps {
  points: IChartPoint[];
  primary: string;
  secondary?: string;
  metric: TMetric;
}

export interface IBranchTableProps {
  branches: TBranch[];
  stats: TReport['branches'];
}
