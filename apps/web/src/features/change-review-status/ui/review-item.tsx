import Chip from '@mui/material/Chip';
import type { ReactElement } from 'react';

import type { TReview } from '@/entities/review';
import type { TReviewStatus } from '@/entities/review';
import { statusLabels, statusSchema } from '@/entities/review';
import { useChangeStatus } from '@/features/change-review-status/model/use-change-status';
import { formatDate } from '@/shared/lib/dates';
import { Choice } from '@/shared/ui/choice';
import { ReportState } from '@/shared/ui/report-state';
const statusColor = {
  new: 'warning',
  in_progress: 'primary',
  resolved: 'success',
} satisfies Record<TReviewStatus, 'warning' | 'primary' | 'success'>;
export const ReviewItem = ({ item, branch }: { item: TReview; branch: string }): ReactElement => {
  const edit = useChangeStatus(item.id);
  return (
    <li className="reviews__item">
      <div>
        <strong>{item.author}</strong>{' '}
        <Chip
          size="small"
          variant="outlined"
          label={statusLabels[item.status]}
          color={statusColor[item.status]}
        />
        <p>
          {branch} · {formatDate(item.created_at)} · Оценка {item.rating} из 5
        </p>
        <p>{item.text}</p>
      </div>
      <Choice
        label={'Статус отзыва ' + String(item.id)}
        value={item.status}
        options={statusLabels}
        disabled={edit.isPending}
        onChange={(value) => {
          edit.mutate(statusSchema.parse(value));
        }}
      />
      {edit.isPending && <p role="status">Сохранение статуса…</p>}
      {edit.isError && (
        <ReportState
          state="error"
          message={edit.error.message}
          retry={() => {
            edit.mutate(edit.variables);
          }}
        />
      )}
    </li>
  );
};
