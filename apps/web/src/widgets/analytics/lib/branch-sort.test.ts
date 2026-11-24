import { expect, it } from 'vitest';

import { nextSort, sortedBranches } from '@/widgets/analytics/lib/branch-sort';
const branches = ['Южный', 'Центр', 'Север'].map((name, i) => ({
  id: i + 1,
  name,
  company_id: 1,
  company: 'Атлас',
}));
const stats = [1, 2].map((branchId) => ({
  branchId,
  rating: 4,
  views: branchId * 5,
  site: 0,
  calls: 0,
  routes: 0,
  reviews: 1,
}));
it('сортирует числа и равные значения устойчиво, пустой филиал остаётся последним в обоих направлениях', () => {
  const descending = nextSort({ column: 'name', direction: 'ascending' }, 'views');
  const ids = (rows: typeof branches): number[] => rows.map((row) => row.id);
  const order = (sort: typeof descending): number[] =>
    ids(sortedBranches({ branches, stats }, sort).map((row) => row.branch));
  expect(order(descending)).toEqual([2, 1, 3]);
  expect(order(nextSort(descending, 'views'))).toEqual([1, 2, 3]);
  expect(order(nextSort(descending, 'rating'))).toEqual([2, 1, 3]);
});
