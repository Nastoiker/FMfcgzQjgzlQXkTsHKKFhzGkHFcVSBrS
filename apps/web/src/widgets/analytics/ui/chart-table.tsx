import type { ReactElement } from 'react';

import { labels } from '@/entities/report';
import { formatDate } from '@/shared/lib/dates';
import type { ISeriesProps } from '@/widgets/analytics/model/chart.interface';

const numbers = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

const value = (n: number | null) => (n === null ? 'Нет данных' : numbers.format(n));

export const ChartTable = ({ points, primary, secondary, metric }: ISeriesProps): ReactElement => (
  <details className="chart__table">
    <summary>Значения по дням</summary>
    <div className="chart__scroll">
      <table>
        <caption>{labels[metric]} по дням</caption>
        <thead>
          <tr>
            <th scope="col">Дата</th>
            <th scope="col">{primary}</th>
            {secondary && <th scope="col">{secondary}</th>}
          </tr>
        </thead>
        <tbody>
          {points.map((row) => (
            <tr key={row.date}>
              <th scope="row">
                <time dateTime={row.date}>{formatDate(row.date)}</time>
              </th>
              <td>{value(row.primary)}</td>
              {secondary && <td>{value(row.secondary)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);
