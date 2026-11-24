import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

import type { IImportRange } from '@/features/import-statistics/model/import.interface';
import { useImport } from '@/features/import-statistics/model/use-import';
import { ReportState } from '@/shared/ui/report-state';
export const ImportPanel = ({ from, to, branchId }: IImportRange): ReactElement => {
  const job = useImport({ from, to, branchId });
  return (
    <section className="import" aria-label="Импорт статистики">
      <Button
        variant="outlined"
        disabled={job.isPending}
        onClick={() => {
          job.mutate();
        }}
      >
        {job.isPending ? 'Загружаем…' : 'Импортировать за период'}
      </Button>
      {job.isSuccess && (
        <p role="status">
          {job.data.rows
            ? 'Сохранено дней: ' + String(job.data.rows)
            : 'Источник не вернул данных за этот период.'}
        </p>
      )}
      {job.isError && (
        <ReportState
          state="error"
          message={job.error.message}
          retry={() => {
            job.mutate();
          }}
        />
      )}
    </section>
  );
};
