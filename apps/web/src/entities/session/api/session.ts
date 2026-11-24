import type { TViewer } from '@/entities/session/model/session';
import { user } from '@/entities/session/model/session';
import { request } from '@/shared/api/http';
export const sessionKey = ['me'];
export const getSession = (): Promise<TViewer> => request('me', user);
