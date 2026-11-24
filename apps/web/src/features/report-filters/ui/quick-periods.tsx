import type { ReactElement } from 'react';

import type {
  IReportFilters,
  TUpdateFilters,
} from '@/features/report-filters/model/filters.interface';
import { dayAgo } from '@/shared/lib/dates';

const presets = [7, 30, 90];
export const QuickPeriods = ({
  filters,
  update,
  focusDates,
}: {
  filters: IReportFilters;
  update: TUpdateFilters;
  focusDates: () => void;
}): ReactElement => {
  const today = dayAgo(0);
  const selected = presets.find(
    (days) => filters.to === today && filters.from === dayAgo(days - 1),
  );
  const isCustom = filters.period === 'custom' || selected === undefined;
  return (
    <nav className="board__periods" aria-label="Быстрый период">
      {presets.map((days) => (
        <button
          key={days}
          aria-pressed={!isCustom && selected === days}
          onClick={() => {
            update({ from: dayAgo(days - 1), to: today, period: '' });
          }}
        >
          {days} дней
        </button>
      ))}
      <button
        aria-pressed={isCustom}
        onClick={() => {
          update({ period: 'custom', from: filters.from, to: filters.to });
          focusDates();
        }}
      >
        Свой
      </button>
    </nav>
  );
};
