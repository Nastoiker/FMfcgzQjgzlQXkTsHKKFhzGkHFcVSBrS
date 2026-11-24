import Skeleton from '@mui/material/Skeleton';
import type { ReactElement } from 'react';

import type { IReportState } from '@/shared/ui/report-state.interface';

export const StateSkeleton = ({ shape = 'line' }: Pick<IReportState, 'shape'>): ReactElement => {
  if (shape === 'cards')
    return (
      <div className="loading-report" aria-hidden="true">
        <div className="cards">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="loading-card">
              <Skeleton width="75%" height={20} />
              <Skeleton width="45%" height={42} />
              <Skeleton width="65%" height={16} />
            </div>
          ))}
        </div>
        <Skeleton className="loading-chart" variant="rounded" />
      </div>
    );
  if (shape === 'rows')
    return (
      <div className="loading-rows" aria-hidden="true">
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} variant="rounded" height={48} />
        ))}
      </div>
    );
  if (shape === 'chart')
    return <Skeleton aria-hidden="true" className="loading-chart" variant="rounded" />;
  return <Skeleton aria-hidden="true" variant="rounded" width="100%" height={24} />;
};
