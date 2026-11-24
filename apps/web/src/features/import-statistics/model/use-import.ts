import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportKeys } from '@/entities/report';
import type { IImportRange } from '@/features/import-statistics/model/import.interface';
import { imported } from '@/features/import-statistics/model/import-result';
import { request } from '@/shared/api/http';
export const useImport = ({
  from,
  to,
  branchId,
}: IImportRange): UseMutationResult<{ rows: number }, Error, void> => {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: () => request('imports', imported, { from, to, branchId: Number(branchId) }),
    onSuccess: () => cache.invalidateQueries({ queryKey: reportKeys.all }),
  });
};
