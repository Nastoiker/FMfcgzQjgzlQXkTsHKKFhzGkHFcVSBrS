import CallOutlined from '@mui/icons-material/CallOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import LanguageRounded from '@mui/icons-material/LanguageRounded';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import Paper from '@mui/material/Paper';
import type { ReactElement } from 'react';

import type { TReport } from '@/entities/report';
import { labels, metricKey } from '@/entities/report';
import { deltaFor, displayValue, tones } from '@/widgets/analytics/lib/metric-display';
const icons = {
  views: VisibilityOutlined,
  site: LanguageRounded,
  calls: CallOutlined,
  routes: NearMeOutlined,
  rating: StarBorderRounded,
  reviews: ForumOutlined,
};
export const MetricCards = ({
  metrics,
  previous,
}: Pick<TReport, 'metrics' | 'previous'>): ReactElement => (
  <section className="cards" aria-label="Показатели">
    {metricKey.options.map((key) => {
      const Icon = icons[key],
        delta = deltaFor(metrics[key], previous[key]);
      return (
        <Paper component="article" variant="outlined" className="cards__item" key={key}>
          <div className="cards__label">
            <span className={'metric-icon metric-icon--' + tones[key]}>
              <Icon fontSize="small" />
            </span>
            <span>{labels[key]}</span>
          </div>
          <strong className="cards__value">{displayValue(metrics[key])}</strong>
          <div className="cards__comparison">
            {delta.value ? (
              <>
                <span className={'delta delta--' + delta.tone}>{delta.value}</span> к прошлому
                периоду
              </>
            ) : (
              'Нет данных для сравнения'
            )}
          </div>
        </Paper>
      );
    })}
  </section>
);
