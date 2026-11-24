import type { ReactElement } from 'react';

import { queryFor, validRange } from '@/features/report-filters';
import { ReportState } from '@/shared/ui/report-state';
import type { IReviewPanelProps } from '@/widgets/reviews/model/reviews.interface';
import { ReviewFilterBar } from '@/widgets/reviews/ui/review-filters';
import { ReviewList } from '@/widgets/reviews/ui/review-list';

export const ReviewPanel = ({
  viewer,
  filters,
  update,
  branches,
}: IReviewPanelProps): ReactElement => {
  const params = new URLSearchParams(queryFor(filters));
  params.set('limit', '5');
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.status) params.set('status', filters.status);
  if (filters.cursor) params.set('cursor', filters.cursor);
  return (
    <section className="reviews" aria-label="Отзывы клиентов">
      <h2>Отзывы клиентов</h2>
      <ReviewFilterBar filters={filters} update={update} />
      {filters.cursor && (
        <button
          onClick={() => {
            update({ cursor: '' });
          }}
        >
          К первой странице
        </button>
      )}
      {validRange(filters) ? (
        <ReviewList range={params.toString()} viewer={viewer} update={update} branches={branches} />
      ) : (
        <ReportState state="empty" message="Выберите период от 1 до 366 дней." />
      )}
    </section>
  );
};
