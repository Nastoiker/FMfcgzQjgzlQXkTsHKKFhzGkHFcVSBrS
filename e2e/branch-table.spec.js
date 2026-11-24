import { expect, test } from '@playwright/test';
import { demoDay, pinDemoClock, login, select, shot } from './browser.js';
test('из таблицы доступных филиалов открывается статистика строки', async ({ page }) => {
  await pinDemoClock(page);
  await login(page);
  const table = page.getByRole('table', { name: 'Статистика филиалов за период' });
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCount(2);
  const response = await page.request.get('/api/dashboard', {
    params: { from: demoDay(29), to: demoDay(), branchId: 1 },
  });
  expect(response.ok()).toBe(true);
  const { metrics } = await response.json();
  const first = rows.first();
  const num = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
  await expect(first.locator('td')).toHaveText(
    [metrics.views, metrics.calls, metrics.rating, metrics.reviews].map((n) =>
      n === null ? '—' : num.format(n),
    ),
  );
  await page.getByRole('link', { name: 'Филиалы', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Филиалы', exact: true })).toBeVisible();
  await shot(page, 'branches');
  await first.getByRole('link').click();
  await expect(select(page, 'Филиал')).toHaveValue('1');
  await expect(page.getByRole('heading', { name: 'Обзор филиалов' })).toBeVisible();
  await expect(rows).toHaveCount(1);
});
test('при выборе компании в таблице администратора остаются её филиалы', async ({ page }) => {
  await pinDemoClock(page);
  await login(page, 'admin');
  const rows = page
    .getByRole('table', { name: 'Статистика филиалов за период' })
    .locator('tbody tr');
  await expect(rows).toHaveCount(4);
  await select(page, 'Компания').selectOption('2');
  await expect(rows).toHaveCount(2);
  await expect(rows.locator('th small')).toHaveText(['Янтарный берег', 'Янтарный берег']);
});

test('на телефоне видны все колонки филиалов и выделен выбранный период', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await pinDemoClock(page);
  await login(page);
  const periods = page.getByRole('navigation', { name: 'Быстрый период' });
  const bg = (button) =>
    button.evaluate((el) => el.ownerDocument.defaultView.getComputedStyle(el).backgroundColor);
  const active = await bg(periods.getByRole('button', { pressed: true }));
  const inactive = await bg(periods.getByRole('button', { name: '7 дней', exact: true }));
  expect(active).not.toEqual(inactive);
  const table = page.locator('.branch-table .table-scroll');
  expect(await table.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  const lines = await table.locator('thead th').evaluateAll((cells) =>
    cells.map((cell) => {
      const range = cell.ownerDocument.createRange();
      range.selectNodeContents(cell.querySelector('button'));
      return range.getClientRects().length;
    }),
  );
  expect(lines).toEqual([1, 1, 1, 1, 1]);
  const value = page.getByLabel('Начало периода');
  const date = await value.inputValue();
  await expect(page.locator('.date-field__control span').first()).toHaveText(
    date.split('-').reverse().join('.'),
  );
});
