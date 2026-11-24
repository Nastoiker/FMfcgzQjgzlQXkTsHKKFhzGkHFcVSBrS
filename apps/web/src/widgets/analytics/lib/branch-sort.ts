import type {
  IBranchRow,
  IBranchSort,
  TBranchColumn,
} from '@/widgets/analytics/model/branch-sort.interface';
import type { IBranchTableProps } from '@/widgets/analytics/model/chart.interface';

const names = new Intl.Collator('ru', { numeric: true });
export const nextSort = (sort: IBranchSort, column: TBranchColumn): IBranchSort => {
  if (column !== sort.column)
    return { column, direction: column === 'name' ? 'ascending' : 'descending' };
  return { column, direction: sort.direction === 'ascending' ? 'descending' : 'ascending' };
};
const compareRows = (a: IBranchRow, b: IBranchRow, sort: IBranchSort): number => {
  const byName = names.compare(a.branch.name, b.branch.name) || a.branch.id - b.branch.id;
  const direction = sort.direction === 'ascending' ? 1 : -1;
  if (sort.column === 'name') return byName * direction;
  const left = a.metrics?.[sort.column] ?? null,
    right = b.metrics?.[sort.column] ?? null;
  if (left === null && right === null) return byName;
  if (left === null) return 1;
  if (right === null) return -1;
  return (left - right) * direction || byName;
};
export const sortedBranches = (
  { branches, stats }: IBranchTableProps,
  sort: IBranchSort,
): IBranchRow[] => {
  const values = new Map(stats.map((row) => [row.branchId, row]));
  return branches
    .map((branch) => ({ branch, metrics: values.get(branch.id) }))
    .sort((a, b) => compareRows(a, b, sort));
};
