import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

import type { IReportState } from '@/shared/ui/report-state.interface';
import { StateSkeleton } from '@/shared/ui/state-skeleton';

const messages = {
  pending: 'Загрузка данных…',
  error: 'Не удалось получить данные',
  empty: 'За этот период данных нет',
};
export const ReportState = ({ state, message, retry, shape }: IReportState): ReactElement => (
  <div
    aria-atomic="true"
    className={'notice notice--' + state}
    role={state === 'error' ? 'alert' : 'status'}
  >
    {state === 'empty' && <InboxOutlined aria-hidden="true" />}
    {state === 'error' && <ErrorOutlineRounded aria-hidden="true" />}
    <span>{message ?? messages[state]}</span>
    {state === 'pending' && <StateSkeleton shape={shape} />}
    {state === 'error' && retry && (
      <Button variant="outlined" onClick={retry}>
        Повторить
      </Button>
    )}
  </div>
);
