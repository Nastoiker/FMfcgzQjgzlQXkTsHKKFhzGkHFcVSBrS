import InsightsRounded from '@mui/icons-material/InsightsRounded';
import type { ReactElement } from 'react';
export const Brand = (): ReactElement => (
  <div className="brand">
    <span className="brand__mark" aria-hidden="true">
      <InsightsRounded />
    </span>
    <span className="brand__type">
      Истинный интеллект<span className="brand__section"> · Аналитика</span>
    </span>
  </div>
);
