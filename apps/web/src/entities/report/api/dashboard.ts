import type { TReport } from '@/entities/report/model/report';
import { dashboard } from '@/entities/report/model/report';
import { request } from '@/shared/api/http';
import type { IQueryScope } from '@/shared/api/query-scope.interface';
const reports = ['dashboard'];
export const reportKeys = {
  all: reports,
  period: (viewer: IQueryScope, range: string) => [...reports, viewer, range],
};
export const getDashboard = (range: string): Promise<TReport> =>
  request('dashboard?' + range, dashboard);
