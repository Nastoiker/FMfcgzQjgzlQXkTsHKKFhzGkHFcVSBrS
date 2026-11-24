import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getDashboard, reportKeys } from '@/entities/report/api/dashboard';
import type { TReport } from '@/entities/report/model/report';
import type { IQueryScope } from '@/shared/api/query-scope.interface';
export const useDashboard = (
  viewer: IQueryScope,
  range: string,
  enabled: boolean,
): UseQueryResult<TReport> =>
  useQuery({
    queryKey: reportKeys.period(viewer, range),
    queryFn: () => getDashboard(range),
    enabled,
  });
