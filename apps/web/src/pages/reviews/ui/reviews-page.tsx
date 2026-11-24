import type { ReactElement } from 'react';

import type { TViewer } from '@/entities/session';
import { ReportWorkspace } from '@/widgets/report-workspace';
import { ReviewPanel } from '@/widgets/reviews';
export const ReviewsPage = ({ viewer }: { viewer: TViewer }): ReactElement => (
  <ReportWorkspace viewer={viewer}>{(props) => <ReviewPanel {...props} />}</ReportWorkspace>
);
