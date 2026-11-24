import type { z } from 'zod';

import type { TReview, TReviewStatus } from '@/entities/review/model/review';
import { reviews, updated } from '@/entities/review/model/review';
import { fetchApi, readJson, request } from '@/shared/api/http';
import type { IQueryScope } from '@/shared/api/query-scope.interface';
const feedback = ['reviews'];
export const reviewKeys = {
  all: feedback,
  page: (viewer: IQueryScope, range: string) => [...feedback, viewer, range],
};
export const getReviews = async (range: string): Promise<{ items: TReview[]; next: string }> => {
  const response = await fetchApi('reviews?' + range);
  return {
    items: await readJson(response, reviews),
    next: response.headers.get('X-Next-Cursor') ?? '',
  };
};

export const changeReview = async (
  id: number,
  status: TReviewStatus,
): Promise<z.infer<typeof updated>> =>
  request('reviews/' + String(id), updated, { status }, 'PATCH');
