import type { ReactElement } from 'react';

import type { TBranch } from '@/entities/branch';
import { scopeLabel } from '@/entities/branch';
const titles: Record<string, string> = { reviews: 'Отзывы', branches: 'Филиалы' };
export const WorkspaceHeading = ({
  branches,
  branchId,
  view,
}: {
  branches: TBranch[];
  branchId: string;
  view: string;
}): ReactElement => (
  <header className="page-title">
    <h1>{titles[view] ?? 'Обзор филиалов'}</h1>
    <p>{scopeLabel(branches, branchId)}</p>
  </header>
);
