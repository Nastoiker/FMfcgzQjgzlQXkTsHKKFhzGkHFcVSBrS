import { expect, it } from 'vitest';

import type { TReport } from '@/entities/report';
import { alignDays } from '@/widgets/analytics/lib/chart-data';

const day = (date: string, rating: number | null): TReport['days'][number] => ({
  date,
  rating,
  views: 0,
  site: 0,
  calls: 0,
  routes: 0,
  reviews: 0,
});
it('выравнивает ряды по календарным датам, сохраняя отсутствующие значения', () => {
  const one = [day('2030-02-02', null), day('2030-02-01', 5)];
  const two = [day('2030-02-01', 2), day('2030-02-03', 4)];
  expect(alignDays(one, two, 'rating')).toEqual([
    { date: '2030-02-01', primary: 5, secondary: 2 },
    { date: '2030-02-02', primary: null, secondary: null },
    { date: '2030-02-03', primary: null, secondary: 4 },
  ]);
  expect(alignDays(one, two, 'views').map((d) => [d.primary, d.secondary])).toEqual([
    [0, 0],
    [0, null],
    [null, 0],
  ]);
});
