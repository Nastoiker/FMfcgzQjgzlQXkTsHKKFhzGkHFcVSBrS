import type { ReactElement } from 'react';

import type { TBranch, TCompany } from '@/entities/branch';
import { visibleBranches } from '@/entities/branch';
import { FilterBar, useReportFilters } from '@/features/report-filters';
import { ReportState } from '@/shared/ui/report-state';
import type { IWorkspaceProps } from '@/widgets/report-workspace/model/workspace.interface';
import { WorkspaceHeading } from '@/widgets/report-workspace/ui/workspace-heading';

const CompanyNotice = ({ reset }: { reset: () => void }): ReactElement => (
  <section className="notice">
    <span>Выбор компании доступен администратору.</span>
    <button onClick={reset}>Мои филиалы</button>
  </section>
);

export const Workspace = ({
  viewer,
  available,
  options,
  children,
}: IWorkspaceProps & {
  available: TBranch[];
  options?: TCompany[];
}): ReactElement => {
  const [filters, update] = useReportFilters();
  if (filters.company && viewer.role === 'client')
    return (
      <CompanyNotice
        reset={() => {
          update({ company: '', branchId: '' });
        }}
      />
    );
  const visible = visibleBranches(available, filters.company);
  return (
    <>
      <WorkspaceHeading branches={visible} branchId={filters.branchId} view={filters.view} />
      <FilterBar filters={filters} update={update} branches={visible} companies={options} />
      {visible.length || filters.branchId ? (
        children({ viewer, filters, update, branches: visible })
      ) : (
        <ReportState state="empty" message="Нет доступных филиалов" />
      )}
    </>
  );
};
