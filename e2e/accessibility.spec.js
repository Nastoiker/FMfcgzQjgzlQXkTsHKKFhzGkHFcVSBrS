import { submitWrongPassword } from './password-fixture.js';
import { test, expect } from '@playwright/test';
import { pinDemoClock, login, select, demoDay } from './browser.js';
test('клавиатура ведёт к содержанию и открывает числовое представление графика', async ({
  page,
}) => {
  await pinDemoClock(page);
  await login(page);
  await page.reload();
  const skip = page.getByRole('link', { name: 'К содержанию' });
  await skip.waitFor({ state: 'attached' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await select(page, 'Филиал').selectOption('1');
  await select(page, 'Сравнить с филиалом').selectOption('2');
  const summary = page.getByText('Значения по дням', { exact: true });
  await summary.focus();
  await page.keyboard.press('Space');
  const table = page.getByRole('table', { name: 'Просмотры карточек по дням' });
  await expect(table.getByRole('columnheader')).toHaveText([
    'Дата',
    'Лунный атлас · Северный',
    'Лунный атлас · Центральный',
  ]);
  const values = async (branchId) => {
    const r = await page.request.get('/api/dashboard', {
      params: { branchId, from: demoDay(29), to: demoDay() },
    });
    return (await r.json()).days.map((d) => String(d.views));
  };
  const [one, two] = await Promise.all([values(1), values(2)]);
  await expect(table.locator('tbody tr td:first-of-type')).toHaveText(one);
  await expect(table.locator('tbody tr td:nth-of-type(2)')).toHaveText(two);
});
test('ошибка входа связана с полем пароля и возвращает ему фокус', async ({ page }) => {
  await page.goto('/login');
  await submitWrongPassword(page);
  const field = page.getByLabel('Пароль');
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription('Неверный логин или пароль');
});
