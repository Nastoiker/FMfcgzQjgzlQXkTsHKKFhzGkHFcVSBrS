import { test, expect } from '@playwright/test';
import { login, pinDemoClock, select, cleanScreen, duringDelay } from './browser.js';
test.beforeEach(async ({ page }) => pinDemoClock(page));
test('отзывы объясняют сбой, ожидание, повтор и пустой период', async ({ page }) => {
  await login(page);
  await page.route(
    '**/api/reviews?**',
    (r) => r.fulfill({ status: 503, body: 'private upstream error' }),
    { times: 1 },
  );
  await page.getByRole('link', { name: 'Отзывы', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось выполнить запрос');
  await expect(page.locator('body')).not.toContainText('private upstream error');
  await duringDelay(
    page,
    '**/api/reviews?**',
    () => page.getByRole('button', { name: 'Повторить' }).click(),
    () => expect(page.getByText('Загрузка отзывов…')).toBeVisible(),
  );
  await expect(page.locator('.reviews__item')).toHaveCount(5);
  await page.goto('/?view=reviews&from=2090-01-01&to=2090-01-02');
  await expect(page.getByText('По выбранным фильтрам отзывов нет')).toBeVisible();
  await cleanScreen(page);
});
test('ошибка экспорта позволяет повторно скачать данные', async ({ page }) => {
  await login(page);
  await page.route('**/api/export?**', (r) => r.fulfill({ status: 503 }), { times: 1 });
  await page.getByRole('button', { name: 'Скачать CSV' }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось выполнить запрос');
  const file = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Повторить' }).click();
  expect((await file).suggestedFilename()).toBe('statistics.csv');
  await cleanScreen(page);
});
test('сравнение объясняет отсутствие ряда только у одного филиала', async ({ page }) => {
  await login(page);
  await select(page, 'Филиал').selectOption('1');
  const original = async (route) => {
    const result = await route.fetch();
    const data = await result.json();
    await route.fulfill({ json: { ...data, days: [] } });
  };
  await page.route('**/api/dashboard?**branchId=2', original, { times: 1 });
  await select(page, 'Сравнить с филиалом').selectOption('2');
  await expect(page.getByRole('status')).toHaveText(
    'У филиала «Лунный атлас · Центральный» нет значений за этот период.',
  );
  await expect(page.locator('path.recharts-area-curve').first()).toBeVisible();
  await cleanScreen(page);
});
test('неудавшееся изменение статуса можно повторить и перечитать', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Отзывы', exact: true }).click();
  const row = page.locator('.reviews__item').first();
  const field = row.getByRole('combobox');
  const old = await field.inputValue(),
    next = old === 'resolved' ? 'new' : 'resolved';
  await page.route('**/api/reviews/*', (r) => r.fulfill({ status: 503 }), { times: 1 });
  try {
    await field.selectOption(next);
    await expect(row.getByRole('alert')).toContainText('Не удалось выполнить запрос');
    await expect(field).toHaveValue(old);
    await row.getByRole('button', { name: 'Повторить' }).click();
    await expect(field).toHaveValue(next);
    await page.reload();
    await expect(field).toHaveValue(next);
  } finally {
    await field.selectOption(old);
    await expect(field).toHaveValue(old);
  }
});
