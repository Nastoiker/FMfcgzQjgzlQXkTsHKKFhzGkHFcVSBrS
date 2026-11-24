import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login, pinDemoClock, demoDay, select } from './browser.js';
test('CSV скачивается из текущей выборки', async ({ page }) => {
  await pinDemoClock(page);
  await login(page);
  await select(page, 'Филиал').selectOption('2');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Скачать CSV' }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe('statistics.csv');
  const csv = await readFile(await file.path(), 'utf8');
  const response = await page.request.get('/api/dashboard', {
    params: { branchId: 2, from: demoDay(29), to: demoDay() },
  });
  const { days } = await response.json();
  const lines = csv.trim().split('\r\n');
  expect(lines.slice(1)).toEqual(
    days.map((d) => [d.date, d.views, d.site, d.calls, d.routes, d.rating, d.reviews].join(',')),
  );
});
