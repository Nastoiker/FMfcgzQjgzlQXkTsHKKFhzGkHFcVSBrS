import type { ReactElement, RefObject } from 'react';
import { useId } from 'react';

import type {
  IReportFilters,
  TUpdateFilters,
} from '@/features/report-filters/model/filters.interface';
import { formatDate } from '@/shared/lib/dates';

interface IDateField {
  label: string;
  value: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}
const DateField = ({ label, value, min, max, onChange, inputRef }: IDateField): ReactElement => {
  const id = useId();
  return (
    <div className="date-field">
      <label htmlFor={id}>{label}</label>
      <div className="date-field__control">
        <input
          id={id}
          ref={inputRef}
          type="date"
          lang="ru"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
        <span aria-hidden="true">{value ? formatDate(value) : 'дд.мм.гггг'}</span>
      </div>
    </div>
  );
};
export const PeriodFields = ({
  filters,
  update,
  startField,
}: {
  startField: RefObject<HTMLInputElement | null>;
  filters: IReportFilters;
  update: TUpdateFilters;
}): ReactElement => (
  <>
    <DateField
      inputRef={startField}
      label="Начало периода"
      value={filters.from}
      max={filters.to}
      onChange={(from) => {
        update({ from, period: 'custom' });
      }}
    />
    <DateField
      label="Конец периода"
      value={filters.to}
      min={filters.from}
      onChange={(to) => {
        update({ to, period: 'custom' });
      }}
    />
  </>
);
