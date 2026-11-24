import { test, expect } from '@playwright/test';
import { login, pinDemoClock, select, shot } from './browser.js';
test('отзывы: фильтры, курсор и сохранение статуса', async ({ page }) => {
  await pinDemoClock(page);
  await login(page);
  await page.getByRole('link', { name: 'Отзывы', exact: true }).click();
  const rows = page.locator('.reviews__item');
  await expect(rows).toHaveCount(5);
  await expect(rows.first()).toContainText('Лунный атлас · Северный');
  await expect(select(page, 'Оценка').locator('option').first()).toHaveText('Все оценки');
  await shot(page, 'reviews');
  const first = await rows.locator('strong').allTextContents();
  await page.getByRole('button', { name: 'Следующая страница' }).click();
  await expect(rows).toHaveCount(5);
  await expect(rows.first().locator('strong')).not.toHaveText(first[0]);
  expect(
    (await rows.locator('strong').allTextContents()).filter((name) => first.includes(name)),
  ).toEqual([]);
  await page.getByRole('button', { name: 'К первой странице' }).click();
  await select(page, 'Оценка').selectOption('5');
  await expect(rows.first()).toContainText('Оценка 5 из 5');
  const field = rows.first().getByRole('combobox');
  const old = await field.inputValue();
  const next = old === 'resolved' ? 'new' : 'resolved';
  try {
    await field.selectOption(next);
    await expect(field).toHaveValue(next);
    await page.reload();
    await expect(field).toHaveValue(next);
  } finally {
    await field.selectOption(old);
    await expect(field).toHaveValue(old);
  }
});
