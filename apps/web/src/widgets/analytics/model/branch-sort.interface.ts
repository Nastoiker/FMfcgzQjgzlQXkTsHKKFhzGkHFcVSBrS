import type { TBranch } from '@/entities/branch';
import type { TReport } from '@/entities/report';

export type TBranchColumn = 'name' | 'views' | 'calls' | 'rating' | 'reviews';
export interface IBranchSort {
  column: TBranchColumn;
  direction: 'ascending' | 'descending';
}
export interface IBranchRow {
  branch: TBranch;
  metrics?: TReport['branches'][number];
}
