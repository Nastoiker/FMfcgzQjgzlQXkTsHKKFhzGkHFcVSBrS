import type { z } from 'zod';

import { httpMessage } from '@/shared/api/http-errors';

export const fetchApi = async (
  path: string,
  body?: unknown,
  method = 'POST',
): Promise<Response> => {
  const signal = AbortSignal.timeout(15000);
  const options: RequestInit = { cache: 'no-store', signal };
  if (body !== undefined) {
    options.method = method;
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  let response: Response;
  try {
    response = await fetch('/api/' + path, options);
  } catch {
    if (signal.aborted) throw new Error('Сервер долго не отвечает. Повторите запрос.');
    throw new Error('Нет связи с сервером. Проверьте подключение.');
  }
  if (!response.ok)
    throw new Error(httpMessage(response.status, path, response.headers.get('Retry-After')));
  return response;
};

export const readJson = async <T>(
  response: Response,
  schema: z.ZodType<T>,
  empty = false,
): Promise<T> => {
  let raw: unknown = null;
  if (response.status !== 204 && !empty) {
    try {
      raw = await response.json();
    } catch {
      throw new Error('Не удалось прочитать ответ сервера.');
    }
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error('Сервер прислал неполные данные. Обновите отчёт.');
  return parsed.data;
};

export const request = async <T>(
  path: string,
  schema: z.ZodType<T>,
  body?: unknown,
  method?: string,
): Promise<T> => readJson(await fetchApi(path, body, method), schema, path === 'logout');
