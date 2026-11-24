import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TReviewStatus } from '@/entities/review';
import { changeReview, reviewKeys } from '@/entities/review';

export const useChangeStatus = (
  id: number,
): UseMutationResult<Awaited<ReturnType<typeof changeReview>>, Error, TReviewStatus> => {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (status: TReviewStatus) => changeReview(id, status),
    onSuccess: () => cache.invalidateQueries({ queryKey: reviewKeys.all }),
  });
};
