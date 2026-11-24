// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ReportState } from '@/shared/ui/report-state';
afterEach(cleanup);
it('отображает загрузку, повтор и пустое состояние отчёта', () => {
  const retry = vi.fn();
  const view = render(<ReportState state="pending" retry={retry} />);
  expect(screen.getByRole('status').textContent).toContain('Загрузка');
  view.rerender(<ReportState state="error" retry={retry} />);
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  expect(retry).toHaveBeenCalledOnce();
  view.rerender(<ReportState state="empty" retry={retry} />);
  expect(screen.getByRole('status').textContent).toContain('данных нет');
});
