import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getSession, sessionKey } from '@/entities/session/api/session';
import type { TViewer } from '@/entities/session/model/session';
export const useSession = (): UseQueryResult<TViewer> =>
  useQuery({ queryKey: sessionKey, queryFn: getSession });
