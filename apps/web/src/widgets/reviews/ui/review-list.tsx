import type { ReactElement } from 'react';

import type { TBranch } from '@/entities/branch';
import { branchLabel } from '@/entities/branch';
import type { TReview } from '@/entities/review';
import { useReviews } from '@/entities/review';
import { ReviewItem } from '@/features/change-review-status';
import { ReportState } from '@/shared/ui/report-state';
import type { IReviewListProps } from '@/widgets/reviews/model/reviews.interface';
const ReviewRows = ({
  items,
  branches,
}: {
  items: TReview[];
  branches: TBranch[];
}): ReactElement => {
  const branchNames = new Map(branches.map((b) => [b.id, branchLabel(b)]));
  return (
    <ul className="reviews__list">
      {items.map((item) => (
        <ReviewItem
          key={item.id}
          item={item}
          branch={branchNames.get(item.branch_id) ?? 'Филиал'}
        />
      ))}
    </ul>
  );
};

export const ReviewList = ({ range, viewer, branches, update }: IReviewListProps): ReactElement => {
  const result = useReviews(viewer, range);
  if (result.isPending)
    return <ReportState state="pending" shape="rows" message="Загрузка отзывов…" />;
  if (result.isError)
    return (
      <ReportState
        state="error"
        message={result.error.message}
        retry={() => void result.refetch()}
      />
    );
  if (!result.data.items.length)
    return <ReportState state="empty" message="По выбранным фильтрам отзывов нет" />;
  return (
    <>
      <ReviewRows items={result.data.items} branches={branches} />
      {result.data.next && (
        <button
          onClick={() => {
            update({ cursor: result.data.next });
          }}
        >
          Следующая страница
        </button>
      )}
    </>
  );
};
