import type { TBranch, TCompany } from '@/entities/branch';
import { useBranches, useCompanies } from '@/entities/branch';
import type { TViewer } from '@/entities/session';
import type { IReportState } from '@/shared/ui/report-state.interface';
type TDirectory = IReportState | { state: 'ready'; branches: TBranch[]; companies?: TCompany[] };
export const useDirectory = (viewer: TViewer): TDirectory => {
  const list = useBranches(viewer),
    options = useCompanies(viewer);
  const admin = viewer.role === 'admin';
  if (list.isError)
    return {
      state: 'error',
      message: 'Не удалось получить филиалы.',
      retry: () => void list.refetch(),
    };
  if (admin && options.isError)
    return {
      state: 'error',
      message: 'Не удалось получить компании.',
      retry: () => void options.refetch(),
    };
  if (list.isPending || (admin && options.isPending))
    return { state: 'pending', message: 'Загрузка филиалов…' };
  if (admin && options.data?.length === 0)
    return { state: 'empty', message: 'Нет доступных компаний' };
  return { state: 'ready', branches: list.data, companies: options.data };
};
