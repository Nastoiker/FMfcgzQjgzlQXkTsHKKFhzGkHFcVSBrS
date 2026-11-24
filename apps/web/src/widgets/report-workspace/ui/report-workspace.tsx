import type { ReactElement } from 'react';

import { ReportState } from '@/shared/ui/report-state';
import { useDirectory } from '@/widgets/report-workspace/model/use-directory';
import type { IWorkspaceProps } from '@/widgets/report-workspace/model/workspace.interface';
import { Workspace } from '@/widgets/report-workspace/ui/workspace';
export const ReportWorkspace = ({ viewer, children }: IWorkspaceProps): ReactElement => {
  const directory = useDirectory(viewer);
  if (directory.state !== 'ready') return <ReportState {...directory} />;
  return (
    <Workspace viewer={viewer} available={directory.branches} options={directory.companies}>
      {children}
    </Workspace>
  );
};
