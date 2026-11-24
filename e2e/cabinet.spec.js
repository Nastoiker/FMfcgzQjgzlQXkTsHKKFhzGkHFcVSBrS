import { test, expect } from '@playwright/test';
import {
  demoDay,
  pinDemoClock,
  shot,
  submit,
  login,
  select,
  cardsMatch,
  cleanScreen,
} from './browser.js';
test.beforeEach(async ({ page }) => pinDemoClock(page));
test('клиент меняет отчёт и получает отказ для чужого филиала', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Логин')).toBeVisible();
  await shot(page, 'login');
  await submit(page);
  await expect(page.getByRole('heading', { name: 'Обзор филиалов' })).toBeVisible();
  const month = { from: demoDay(29), to: demoDay() };
  const total = await cardsMatch(page, month);
  await expect(page.getByRole('button', { name: '30 дней', pressed: true })).toBeVisible();
  await shot(page, 'dashboard');
  await select(page, 'Филиал').selectOption('1');
  const branch = await cardsMatch(page, { ...month, branchId: 1 });
  expect(branch.views).not.toBe(total.views);
  await page.getByRole('button', { name: '7 дней', exact: true }).click();
  const week = { from: demoDay(6), to: demoDay(), branchId: 1 };
  expect((await cardsMatch(page, week)).views).not.toBe(branch.views);
  await select(page, 'Показатель').selectOption('calls');
  await page.reload();
  await expect(select(page, 'Показатель')).toHaveValue('calls');
  await expect(select(page, 'Филиал')).toHaveValue('1');
  await expect(page.getByLabel('Начало периода')).toHaveValue(week.from);
  await cardsMatch(page, week);
  await expect(page.getByRole('button', { name: '7 дней', pressed: true })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Динамика: Звонки' }).locator('svg.recharts-surface').first(),
  ).toBeVisible();
  await shot(page, 'branch');
  await page.goto('/?branchId=3');
  await expect(page.getByText('Филиал не найден')).toBeVisible();
  await expect(page.locator('article')).toHaveCount(0);
  await shot(page, 'access-error');
  await page.getByRole('button', { name: 'Выйти' }).click();
  await expect(page.getByLabel('Пароль')).toBeVisible();
  expect((await page.request.get('/api/me')).status()).toBe(401);
});
test('администратор переключает компанию и импортирует', async ({ page }) => {
  await login(page, 'admin');
  await select(page, 'Компания').selectOption('2');
  await expect(select(page, 'Филиал').locator('option')).toHaveCount(3);
  await expect(select(page, 'Филиал')).not.toContainText('Лунный атлас');
  await cardsMatch(page, { from: demoDay(29), to: demoDay(), company: 2 });
  await select(page, 'Филиал').selectOption('3');
  await cardsMatch(page, { from: demoDay(29), to: demoDay(), company: 2, branchId: 3 });
  await page.getByRole('button', { name: 'Импортировать за период' }).click();
  await expect(page.getByText('Сохранено дней: 30')).toBeVisible();
  await shot(page, 'import');
  await cleanScreen(page);
});
