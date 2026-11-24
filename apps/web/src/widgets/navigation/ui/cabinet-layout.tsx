import type { ReactElement } from 'react';

import type { TViewer } from '@/entities/session';
import { useSession } from '@/entities/session';
import { ReportState } from '@/shared/ui/report-state';
import { CabinetSidebar } from '@/widgets/navigation/ui/cabinet-sidebar';
export const CabinetLayout = ({
  children,
}: {
  children: (viewer: TViewer) => ReactElement;
}): ReactElement => {
  const me = useSession();
  if (me.isError)
    return (
      <main className="board" id="cabinet-main" tabIndex={-1}>
        <ReportState state="error" message={me.error.message} retry={() => void me.refetch()} />
      </main>
    );
  if (me.isPending)
    return (
      <main className="board" id="cabinet-main" tabIndex={-1}>
        <ReportState state="pending" message="Загрузка кабинета…" />
      </main>
    );
  return (
    <div className="cabinet">
      <CabinetSidebar viewer={me.data} />
      <main className="board" id="cabinet-main" tabIndex={-1}>
        {children(me.data)}
      </main>
    </div>
  );
};
