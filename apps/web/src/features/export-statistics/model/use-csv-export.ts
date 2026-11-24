import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { fetchApi } from '@/shared/api/http';
const save = async (range: string): Promise<void> => {
  const response = await fetchApi('export?' + range);
  let blob: Blob;
  try {
    blob = await response.blob();
  } catch {
    throw new Error('Загрузка файла прервалась. Повторите экспорт.');
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'statistics.csv';
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};
export const useCsvExport = (range: string): UseMutationResult<void, Error, void> =>
  useMutation({ mutationFn: () => save(range) });
