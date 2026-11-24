import { z } from 'zod';

export const statusSchema = z.enum(['new', 'in_progress', 'resolved']);

export type TReviewStatus = z.infer<typeof statusSchema>;

export const statusLabels: Record<TReviewStatus, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  resolved: 'Обработан',
};

export const updated = z.object({ id: z.number().int(), status: statusSchema });

export const reviews = z.array(
  updated.extend({
    branch_id: z.number().int(),
    created_at: z.iso.datetime(),
    rating: z.number().int().min(1).max(5),
    text: z.string(),
    author: z.string(),
  }),
);

export type TReview = z.infer<typeof reviews>[number];
