// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { CabinetRoutes } from '@/app/cabinet-routes';
import { branchKeys } from '@/entities/branch';
import type { TViewer } from '@/entities/session';
import { sessionKey } from '@/entities/session';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('отчёт проходит от загрузки через ошибку к пустому ответу после повтора', async () => {
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const viewer: TViewer = { login: 'client@example.com', role: 'client', company_id: 1 };
  cache.setQueryData(sessionKey, viewer);
  cache.setQueryData(branchKeys.list(viewer), [
    { id: 1, company_id: 1, name: 'Северный', company: 'Лунный атлас' },
  ]);
  const zero = { views: 0, routes: 0, site: 0, calls: 0, rating: null, reviews: 0 };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response('', { status: 503 }))
    .mockResolvedValueOnce(Response.json({ metrics: zero, previous: zero, days: [] }));
  vi.stubGlobal('fetch', fetcher);
  render(
    <MemoryRouter>
      <QueryClientProvider client={cache}>
        <CabinetRoutes />
      </QueryClientProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole('status').textContent).toContain('Загрузка');
  fireEvent.click(await screen.findByRole('button', { name: 'Повторить' }));
  expect(await screen.findByText('За этот период данных нет')).toBeTruthy();
  expect(fetcher).toHaveBeenCalledTimes(2);
  cache.clear();
});
