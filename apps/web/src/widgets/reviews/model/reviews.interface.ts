import type { TBranch } from '@/entities/branch';
import type { TViewer } from '@/entities/session';
import type { IReportFilters, TUpdateFilters } from '@/features/report-filters';

interface IReviewProps {
  viewer: TViewer;
  branches: TBranch[];
  update: TUpdateFilters;
}

export interface IReviewPanelProps extends IReviewProps {
  filters: IReportFilters;
}

export interface IReviewListProps extends IReviewProps {
  range: string;
}
