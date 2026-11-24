import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { notifySessionChange } from '@/entities/session';
import { request } from '@/shared/api/http';
export const useLogout = (): UseMutationResult<null, Error, void> => {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: () => request('logout', z.null(), {}),
    onSuccess: () => {
      cache.clear();
      notifySessionChange();
      location.replace('/login');
    },
  });
};
