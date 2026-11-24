import TuneRounded from '@mui/icons-material/TuneRounded';
import Paper from '@mui/material/Paper';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { branchChoices } from '@/entities/branch';
import type { IFilterBarProps } from '@/features/report-filters/model/filters.interface';
import { PeriodFields } from '@/features/report-filters/ui/period-fields';
import { QuickPeriods } from '@/features/report-filters/ui/quick-periods';
import { Choice } from '@/shared/ui/choice';
const BranchFields = ({ companies, branches, filters, update }: IFilterBarProps): ReactElement => (
  <>
    {companies && (
      <Choice
        label="Компания"
        value={filters.company}
        all="Все компании"
        options={Object.fromEntries(companies.map((c) => [String(c.id), c.name]))}
        onChange={(company) => {
          update({ company, branchId: '' });
        }}
      />
    )}
    <Choice
      label="Филиал"
      value={filters.branchId}
      all="Все доступные филиалы"
      options={branchChoices(branches)}
      onChange={(branchId) => {
        update({ branchId });
      }}
    />
  </>
);

export const FilterBar = (props: IFilterBarProps): ReactElement => {
  const startField = useRef<HTMLInputElement>(null);
  return (
    <Paper
      component="section"
      variant="outlined"
      className="filter-panel"
      aria-label="Фильтры отчёта"
    >
      <div className="filter-panel__head">
        <h2>
          <TuneRounded fontSize="small" />
          Фильтры
        </h2>
        <QuickPeriods
          filters={props.filters}
          update={props.update}
          focusDates={() => startField.current?.focus()}
        />
      </div>
      <div className="filters">
        <BranchFields {...props} />
        <PeriodFields filters={props.filters} update={props.update} startField={startField} />
      </div>
    </Paper>
  );
};
