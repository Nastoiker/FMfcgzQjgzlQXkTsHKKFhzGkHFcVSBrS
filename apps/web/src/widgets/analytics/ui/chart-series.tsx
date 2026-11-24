import type { ReactElement } from 'react';

import { labels } from '@/entities/report';
import type { ISeriesProps } from '@/widgets/analytics/model/chart.interface';
import { ChartTable } from '@/widgets/analytics/ui/chart-table';
import { Plot } from '@/widgets/analytics/ui/plot';

const MissingSeries = ({ points, primary, secondary }: ISeriesProps): ReactElement | null => {
  if (!secondary) return null;
  let name: string | undefined;
  if (points.every((p) => p.primary === null)) name = primary;
  if (points.every((p) => p.secondary === null)) name = secondary;
  return name ? <p role="status">У филиала «{name}» нет значений за этот период.</p> : null;
};

export const ChartSeries = (props: ISeriesProps): ReactElement => (
  <figure className="chart__figure" aria-label={labels[props.metric] + ' по дням'}>
    <figcaption className="sr-only">
      График показывает значения по календарным дням. Точные значения доступны в таблице ниже.
    </figcaption>
    {props.secondary && (
      <ul className="chart__legend" aria-label="Филиалы на графике">
        <li>{props.primary}</li>
        <li>{props.secondary}</li>
      </ul>
    )}
    <MissingSeries {...props} />
    <Plot {...props} />
    <ChartTable {...props} />
  </figure>
);
