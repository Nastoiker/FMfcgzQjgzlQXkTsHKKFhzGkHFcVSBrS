import Paper from '@mui/material/Paper';
import type { ReactElement } from 'react';

import type { TMetric, TReport } from '@/entities/report';
import { labels, metricKey } from '@/entities/report';
import type { TUpdateFilters } from '@/features/report-filters';
import { deltaFor, displayValue } from '@/widgets/analytics/lib/metric-display';
interface IMetricSelection {
  selected: TMetric;
  update: TUpdateFilters;
  report: TReport;
}
export const MetricCards = ({ report, selected, update }: IMetricSelection): ReactElement => (
  <section className="cards" aria-label="Показатели">
    {metricKey.options.map((key) => {
      const delta = deltaFor(report.metrics[key], report.previous[key]);
      return (
        <Paper
          component="article"
          variant="outlined"
          className="cards__item"
          data-active={selected === key}
          key={key}
        >
          <button
            className="cards__label"
            type="button"
            aria-pressed={selected === key}
            onClick={() => {
              update({ metric: key });
            }}
          >
            {labels[key]}
          </button>
          <strong className="cards__value">{displayValue(report.metrics[key])}</strong>
          <div className="cards__comparison">
            {delta.value ? (
              <span className={'delta delta--' + delta.tone}>{delta.value}</span>
            ) : (
              'Нет данных для сравнения'
            )}
          </div>
        </Paper>
      );
    })}
  </section>
);
