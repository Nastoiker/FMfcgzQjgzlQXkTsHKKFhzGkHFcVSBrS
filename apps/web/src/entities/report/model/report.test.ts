import { expect, it } from 'vitest';

import { dashboard } from '@/entities/report/model/report';
it('принимает пустой период и отклоняет отсутствующий показатель', () => {
  const metrics = { views: 0, site: 0, calls: 0, routes: 0, rating: null, reviews: 0 };
  expect(dashboard.safeParse({ metrics, previous: metrics, days: [] }).success).toBe(true);
  expect(
    dashboard.safeParse({ previous: metrics, metrics: { ...metrics, views: '0' }, days: [] })
      .success,
  ).toBe(false);
});
