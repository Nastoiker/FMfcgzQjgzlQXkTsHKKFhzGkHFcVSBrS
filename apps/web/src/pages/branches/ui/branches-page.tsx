import type { ReactElement } from 'react';

import type { TViewer } from '@/entities/session';
import { Report } from '@/widgets/analytics';
import { ReportWorkspace } from '@/widgets/report-workspace';
export const BranchesPage = ({ viewer }: { viewer: TViewer }): ReactElement => (
  <ReportWorkspace viewer={viewer}>{(props) => <Report {...props} tableOnly />}</ReportWorkspace>
);
