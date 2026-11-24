import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { TViewer } from '@/entities/session';
import { notifySessionChange, user } from '@/entities/session';
import { sessionKey } from '@/entities/session';
import { request } from '@/shared/api/http';
export const useLogin = (): UseMutationResult<TViewer, Error, FormData> => {
  const cache = useQueryClient(),
    go = useNavigate();
  const [params] = useSearchParams();
  return useMutation({
    mutationFn: (form: FormData) =>
      request('login', user, { login: form.get('login'), password: form.get('password') }),
    onSuccess: (account) => {
      cache.clear();
      cache.setQueryData(sessionKey, account);
      notifySessionChange();
      void go(
        { pathname: '/', search: new URLSearchParams(params.get('filters') ?? '').toString() },
        { replace: true },
      );
    },
  });
};
