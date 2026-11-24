import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

import { useCsvExport } from '@/features/export-statistics/model/use-csv-export';
import { ReportState } from '@/shared/ui/report-state';
export const CsvExport = ({ range }: { range: string }): ReactElement => {
  const job = useCsvExport(range);
  const download = () => {
    job.mutate();
  };
  return (
    <div className="report__export">
      <Button
        size="small"
        variant="outlined"
        startIcon={<FileDownloadOutlined />}
        onClick={download}
        disabled={job.isPending}
      >
        {job.isPending ? 'Скачивание…' : 'Скачать CSV'}
      </Button>
      {job.isError && <ReportState state="error" message={job.error.message} retry={download} />}
    </div>
  );
};
