import type { ReactElement } from 'react';

import { statusLabels } from '@/entities/review';
import type { IReportFilters, TUpdateFilters } from '@/features/report-filters';
import { Choice } from '@/shared/ui/choice';

const ratingLabels = Object.fromEntries(
  [1, 2, 3, 4, 5].map((n) => [String(n), String(n) + ' из 5']),
);

export const ReviewFilterBar = ({
  filters,
  update,
}: {
  filters: IReportFilters;
  update: TUpdateFilters;
}): ReactElement => (
  <div className="reviews__filters">
    <Choice
      label="Оценка"
      value={filters.rating}
      all="Все оценки"
      options={ratingLabels}
      onChange={(rating) => {
        update({ rating });
      }}
    />
    <Choice
      label="Статус обработки"
      value={filters.status}
      all="Все статусы"
      options={statusLabels}
      onChange={(status) => {
        update({ status });
      }}
    />
  </div>
);
