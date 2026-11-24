import type { ReactElement } from 'react';

import type { TViewer } from '@/entities/session';
import { Report } from '@/widgets/analytics';
import { ReportWorkspace } from '@/widgets/report-workspace';
export const DashboardPage = ({ viewer }: { viewer: TViewer }): ReactElement => (
  <ReportWorkspace viewer={viewer}>{(props) => <Report {...props} />}</ReportWorkspace>
);
