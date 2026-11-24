import { useSearchParams } from 'react-router-dom';

import { metricKey } from '@/entities/report';
import type {
  IReportFilters,
  TUpdateFilters,
} from '@/features/report-filters/model/filters.interface';
import { dayAgo } from '@/shared/lib/dates';

export const useReportFilters = (): [IReportFilters, TUpdateFilters] => {
  const [params, setParams] = useSearchParams();
  const filters = {
    compareId: params.get('compareId') ?? '',
    branchId: params.get('branchId') ?? '',
    period: params.get('period') ?? '',
    company: params.get('company') ?? '',
    from: params.get('from') ?? dayAgo(29),
    to: params.get('to') ?? dayAgo(0),
    view: params.get('view') ?? '',
    rating: params.get('rating') ?? '',
    status: params.get('status') ?? '',
    cursor: params.get('cursor') ?? '',
    metric: metricKey.catch('views').parse(params.get('metric')),
  };
  const update: TUpdateFilters = (changes) => {
    const next = new URLSearchParams(params);
    if ('branchId' in changes || 'company' in changes) next.delete('compareId');
    if (['from', 'to', 'company', 'branchId', 'rating', 'status'].some((key) => key in changes))
      next.delete('cursor');
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' && key !== 'from' && key !== 'to') next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };
  return [filters, update];
};
