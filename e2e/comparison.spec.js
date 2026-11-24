import { test, expect } from '@playwright/test';
import { pinDemoClock, login, select, shot } from './browser.js';
test('сравнение двух доступных филиалов сохраняется в ссылке', async ({ page }) => {
  await pinDemoClock(page);
  await login(page);
  await expect(select(page, 'Сравнить с филиалом')).toBeDisabled();
  await select(page, 'Филиал').selectOption('1');
  await select(page, 'Сравнить с филиалом').selectOption('2');
  const legend = page.getByRole('list', { name: 'Филиалы на графике' });
  await expect(legend.getByRole('listitem')).toHaveText([
    'Лунный атлас · Северный',
    'Лунный атлас · Центральный',
  ]);
  await select(page, 'Показатель').selectOption('calls');
  await page.reload();
  await expect(select(page, 'Сравнить с филиалом')).toHaveValue('2');
  await expect(
    page.getByRole('region', { name: 'Динамика: Звонки' }).locator('path.recharts-area-curve'),
  ).toHaveCount(2);
  await shot(page, 'comparison');
  await page.getByRole('button', { name: 'Сбросить сравнение' }).click();
  await expect(legend).toHaveCount(0);
});
test('сравнение не показывает ряд закрытого филиала', async ({ page }) => {
  await pinDemoClock(page);
  await login(page);
  await page.goto('/?branchId=1&compareId=3');
  await expect(page.getByRole('alert')).toHaveText(/Филиал не найден/);
  await expect(page.getByRole('list', { name: 'Филиалы на графике' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Сбросить сравнение' }).click();
  await expect(page.locator('path.recharts-area-curve')).toHaveCount(1);
});
