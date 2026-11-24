import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import Paper from '@mui/material/Paper';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { TBranch } from '@/entities/branch';
import type { TReport } from '@/entities/report';
import { ReportState } from '@/shared/ui/report-state';
import { nextSort, sortedBranches } from '@/widgets/analytics/lib/branch-sort';
import { displayValue } from '@/widgets/analytics/lib/metric-display';
import type { IBranchSort } from '@/widgets/analytics/model/branch-sort.interface';
import type { IBranchTableProps } from '@/widgets/analytics/model/chart.interface';
import { BranchTableHead } from '@/widgets/analytics/ui/branch-table-head';
const branchSearch = (search: string, id: number): string => {
  const params = new URLSearchParams(search);
  for (const key of ['view', 'compareId', 'cursor']) params.delete(key);
  params.set('branchId', String(id));
  return '?' + params.toString();
};
const BranchRow = ({
  branch,
  row,
  search,
}: {
  branch: TBranch;
  row: TReport['branches'][number] | undefined;
  search: string;
}): ReactElement => (
  <tr>
    <th scope="row">
      <Link to={branchSearch(search, branch.id)} aria-label={'Статистика филиала ' + branch.name}>
        {branch.name}
        <ArrowForwardRounded fontSize="inherit" />
      </Link>
      <small>{branch.company}</small>
    </th>
    <td>{displayValue(row?.views ?? null)}</td>
    <td>{displayValue(row?.calls ?? null)}</td>
    <td>{displayValue(row?.rating ?? null)}</td>
    <td>{displayValue(row?.reviews ?? null)}</td>
  </tr>
);

export const BranchTable = ({ branches, stats }: IBranchTableProps): ReactElement => {
  const { search } = useLocation();
  const [sort, setSort] = useState<IBranchSort>({ column: 'name', direction: 'ascending' });
  const rows = sortedBranches({ branches, stats }, sort);
  return (
    <Paper
      component="section"
      variant="outlined"
      className="branch-table"
      aria-label="Статистика филиалов"
    >
      <div className="panel-heading">
        <h2>Филиалы за период</h2>
        <span className="count-badge">{branches.length}</span>
      </div>
      {!stats.length && (
        <ReportState state="empty" message="У филиалов нет показателей за выбранные даты." />
      )}
      <div className="table-scroll">
        <table aria-label="Статистика филиалов за период">
          <BranchTableHead
            sort={sort}
            onSort={(column) => {
              setSort((prev) => nextSort(prev, column));
            }}
          />
          <tbody>
            {rows.map(({ branch, metrics }) => (
              <BranchRow key={branch.id} branch={branch} row={metrics} search={search} />
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  );
};
