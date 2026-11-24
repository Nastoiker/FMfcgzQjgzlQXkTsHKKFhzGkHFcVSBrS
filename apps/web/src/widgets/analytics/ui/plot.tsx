import type { ReactElement } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { labels } from '@/entities/report';
import type { ISeriesProps } from '@/widgets/analytics/model/chart.interface';

const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
};

const shortDate = (value: string) => value.slice(8, 10) + '.' + value.slice(5, 7);

const gradient = (
  <defs>
    <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--primary-line)" stopOpacity={0.24} />
      <stop offset="100%" stopColor="var(--primary-line)" stopOpacity={0.02} />
    </linearGradient>
  </defs>
);

export const Plot = ({ points, primary, secondary, metric }: ISeriesProps): ReactElement => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart
      aria-label={labels[metric] + ' по дням'}
      accessibilityLayer
      data={points}
      margin={{ left: -18, right: 18, top: 12 }}
    >
      {gradient}
      <CartesianGrid stroke="var(--grid)" vertical={false} />
      <XAxis stroke="var(--muted)" dataKey="date" tickFormatter={shortDate} minTickGap={38} />
      <YAxis stroke="var(--muted)" />
      <Tooltip contentStyle={tooltipStyle} />
      <Area
        name={primary}
        dataKey="primary"
        stroke="var(--primary-line)"
        fill="url(#area-fill)"
        strokeWidth={3}
        dot={points.length === 1 ? { r: 4 } : false}
        isAnimationActive={false}
      />
      {secondary && (
        <Area
          name={secondary}
          dataKey="secondary"
          stroke="var(--secondary-line)"
          fill="none"
          strokeDasharray="7 4"
          strokeWidth={3}
          dot={points.length === 1 ? { r: 4 } : false}
          isAnimationActive={false}
        />
      )}
    </AreaChart>
  </ResponsiveContainer>
);
