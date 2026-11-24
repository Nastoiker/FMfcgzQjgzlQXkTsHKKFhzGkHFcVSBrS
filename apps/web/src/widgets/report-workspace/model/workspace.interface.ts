import type { ReactElement } from 'react';

import type { TBranch } from '@/entities/branch';
import type { TViewer } from '@/entities/session';
import type { IReportFilters, TUpdateFilters } from '@/features/report-filters';
export interface IWorkspaceProps {
  viewer: TViewer;
  children: (props: {
    viewer: TViewer;
    branches: TBranch[];
    filters: IReportFilters;
    update: TUpdateFilters;
  }) => ReactElement;
}
