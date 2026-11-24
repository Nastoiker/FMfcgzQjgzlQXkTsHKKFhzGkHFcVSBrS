import type { TBranch, TCompany } from '@/entities/branch';
import type { TMetric } from '@/entities/report';

export interface IReportFilters {
  branchId: string;
  period: string;
  compareId: string;
  company: string;
  from: string;
  to: string;
  metric: TMetric;
  view: string;
  rating: string;
  status: string;
  cursor: string;
}

export type TUpdateFilters = (changes: Partial<IReportFilters>) => void;

export interface IFilterBarProps {
  filters: IReportFilters;
  update: TUpdateFilters;
  companies?: TCompany[];
  branches: TBranch[];
}
