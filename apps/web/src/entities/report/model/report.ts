import { z } from 'zod';

import { count } from '@/shared/api/count';

const metrics = z.object({
  views: count,
  site: count,
  calls: count,
  routes: count,
  rating: z.number().min(1).max(5).nullable(),
  reviews: count,
});

export const metricKey = metrics.keyof();

export const dashboard = z.object({
  metrics,
  previous: metrics,
  branches: z.array(metrics.extend({ branchId: z.number().int().positive() })).default([]),
  days: z.array(metrics.extend({ date: z.iso.date() })),
});

export type TReport = z.infer<typeof dashboard>;

export type TMetric = z.infer<typeof metricKey>;

export const labels: Record<TMetric, string> = {
  views: 'Просмотры карточек',
  site: 'Переходы на сайт',
  calls: 'Звонки',
  routes: 'Построенные маршруты',
  rating: 'Средний рейтинг',
  reviews: 'Отзывы',
};
