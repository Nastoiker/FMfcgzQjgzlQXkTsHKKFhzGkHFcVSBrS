import type { ReactElement } from 'react';

import { useDashboard } from '@/entities/report';
import { CsvExport } from '@/features/export-statistics';
import { ImportPanel } from '@/features/import-statistics';
import { queryFor, validRange } from '@/features/report-filters';
import { ReportState } from '@/shared/ui/report-state';
import type { IChartProps } from '@/widgets/analytics/model/chart.interface';
import { BranchTable } from '@/widgets/analytics/ui/branch-table';
import { MetricCards } from '@/widgets/analytics/ui/metric-cards';
import { MetricChart } from '@/widgets/analytics/ui/metric-chart';
export const Report = (
  props: Omit<IChartProps, 'days'> & { tableOnly?: boolean },
): ReactElement => {
  const { filters, viewer, branches } = props;
  const range = queryFor(filters),
    valid = validRange(filters);
  const report = useDashboard(viewer, range, valid);
  if (!valid) return <ReportState state="empty" message="Выберите период от 1 до 366 дней." />;
  if (report.isError)
    return (
      <ReportState
        state="error"
        message={report.error.message}
        retry={() => void report.refetch()}
      />
    );
  if (report.isPending)
    return <ReportState state="pending" shape={props.tableOnly ? 'rows' : 'cards'} />;
  const visible = branches.filter(
    (branch) => !filters.branchId || String(branch.id) === filters.branchId,
  );
  const table = <BranchTable branches={visible} stats={report.data.branches} />;
  if (props.tableOnly) return table;
  return (
    <>
      <div className="panel-heading summary-heading">
        <div>
          <h2>Показатели</h2>
          <p>Изменение к предыдущему периоду</p>
        </div>
        <CsvExport key={range} range={range} />
      </div>
      <MetricCards report={report.data} selected={filters.metric} update={props.update} />
      <MetricChart days={report.data.days} {...props} />
      {table}
      {viewer.role === 'admin' && filters.branchId && <ImportPanel key={range} {...filters} />}
    </>
  );
};
