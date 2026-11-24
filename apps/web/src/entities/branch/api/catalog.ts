import type { TBranch, TCompany } from '@/entities/branch/model/catalog';
import { branches, companies } from '@/entities/branch/model/catalog';
import { request } from '@/shared/api/http';
import type { IQueryScope } from '@/shared/api/query-scope.interface';
export const branchKeys = {
  list: (viewer: IQueryScope) => ['branches', viewer],
  companies: (viewer: IQueryScope) => ['companies', viewer],
};
export const getBranches = (): Promise<TBranch[]> => request('branches', branches);
export const getCompanies = (): Promise<TCompany[]> => request('companies', companies);
