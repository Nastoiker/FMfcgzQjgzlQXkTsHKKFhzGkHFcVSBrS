import { test, expect } from '@playwright/test';
import { pinDemoClock, login, select, shot } from './browser.js';
const fits = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
const background = (page) =>
  page
    .locator('body')
    .evaluate((el) => el.ownerDocument.defaultView.getComputedStyle(el).backgroundColor);
test('обе темы на 375 px сохраняют выбор и ширину отчёта и отзывов', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'light' });
  await pinDemoClock(page);
  await login(page);
  const light = await background(page);
  await select(page, 'Тема').selectOption('dark');
  const dark = await background(page);
  expect(dark).not.toBe(light);
  await page.reload();
  await expect(select(page, 'Тема')).toHaveValue('dark');
  expect(await background(page)).toBe(dark);
  await select(page, 'Филиал').selectOption('1');
  await select(page, 'Сравнить с филиалом').selectOption('2');
  await expect(page.getByRole('list', { name: 'Филиалы на графике' })).toBeVisible();
  const ink = await page
    .locator('.recharts-cartesian-axis-tick-value')
    .first()
    .evaluate((el) => el.ownerDocument.defaultView.getComputedStyle(el).fill);
  const label = await page
    .locator('.chart label')
    .first()
    .evaluate((el) => el.ownerDocument.defaultView.getComputedStyle(el).color);
  expect(ink).toBe(label);
  await shot(page, 'mobile-dark');
  await page.getByText('Значения по дням', { exact: true }).click();
  await expect(page.getByRole('table', { name: 'Просмотры карточек по дням' })).toBeVisible();
  await fits(page);
  await page.getByRole('button', { name: 'Открыть меню' }).click();
  await page.getByRole('link', { name: 'Отзывы', exact: true }).click();
  await expect(page.locator('.reviews__item').first()).toBeVisible();
  await fits(page);
  await select(page, 'Тема').selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await background(page)).toBe(light);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(select(page, 'Тема')).toHaveValue('system');
  expect(await background(page)).toBe(dark);
});
