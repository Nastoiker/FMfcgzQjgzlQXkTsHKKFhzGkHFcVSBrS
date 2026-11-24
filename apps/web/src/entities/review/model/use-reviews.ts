import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getReviews, reviewKeys } from '@/entities/review/api/reviews';
import type { IQueryScope } from '@/shared/api/query-scope.interface';
export const useReviews = (
  viewer: IQueryScope,
  range: string,
): UseQueryResult<Awaited<ReturnType<typeof getReviews>>> =>
  useQuery({ queryKey: reviewKeys.page(viewer, range), queryFn: () => getReviews(range) });
