import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { branchKeys, getBranches, getCompanies } from '@/entities/branch/api/catalog';
import type { TBranch, TCompany } from '@/entities/branch/model/catalog';
import type { IQueryScope } from '@/shared/api/query-scope.interface';

export const useBranches = (viewer: IQueryScope): UseQueryResult<TBranch[]> =>
  useQuery({
    queryKey: branchKeys.list(viewer),
    queryFn: getBranches,
  });
export const useCompanies = (viewer: IQueryScope): UseQueryResult<TCompany[]> =>
  useQuery({
    queryKey: branchKeys.companies(viewer),
    queryFn: getCompanies,
    enabled: viewer.role === 'admin',
  });
