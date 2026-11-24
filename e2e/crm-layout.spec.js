import { expect, test } from '@playwright/test';
import { login, pinDemoClock, select, duringDelay } from './browser.js';
test.beforeEach(async ({ page }) => pinDemoClock(page));
test('выбор показателя в сводке меняет график и сохраняется в ссылке', async ({ page }) => {
  await login(page);
  const summary = page.getByRole('region', { name: 'Показатели', exact: true });
  const calls = summary.getByRole('button', { name: 'Звонки', exact: true });
  await calls.focus();
  await page.keyboard.press('Enter');
  await expect(calls).toHaveAttribute('aria-pressed', 'true');
  await expect(select(page, 'Показатель')).toHaveValue('calls');
  await expect(page.getByRole('region', { name: 'Динамика: Звонки' })).toBeVisible();
  await page.reload();
  await expect(calls).toHaveAttribute('aria-pressed', 'true');
});
const columns = (page) =>
  page
    .locator('.cards')
    .evaluate(
      (el) =>
        el.ownerDocument.defaultView.getComputedStyle(el).gridTemplateColumns.split(' ').length,
    );
test('на телефоне форма входа помещается в экран', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');
  await expect(page.getByLabel('Логин')).toBeInViewport();
  await expect(page.getByLabel('Пароль')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
});
test('на 1440 px видны шесть карточек в ряд, на планшете и телефоне меняется меню и сетка', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await login(page);
  const sidebar = page.getByRole('complementary', { name: 'Навигация кабинета' });
  await expect(sidebar).toBeVisible();
  expect((await sidebar.boundingBox()).width).toBe(240);
  expect(await columns(page)).toBe(6);
  await expect(sidebar.getByRole('link', { name: 'Дашборд' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.setViewportSize({ width: 899, height: 900 });
  const open = page.getByRole('button', { name: 'Открыть меню' });
  await expect(open).toBeVisible();
  expect(await columns(page)).toBe(2);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await columns(page)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await open.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('dialog', { name: 'Меню кабинета' });
  await expect(menu.getByRole('link', { name: 'Отзывы' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(open).toBeFocused();
  await open.click();
  await menu.getByRole('link', { name: 'Филиалы' }).click();
  await expect(menu).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Филиалы', exact: true })).toBeVisible();
});
test('сортировка таблицы учитывает числовые значения и меняет направление', async ({ page }) => {
  await login(page, 'admin');
  const table = page.getByRole('table', { name: 'Статистика филиалов за период' });
  const header = table.getByRole('columnheader', { name: 'Просмотры' });
  const values = async () =>
    (await table.locator('tbody td:first-of-type').allTextContents()).map((value) =>
      Number(value.replace(/\s/g, '')),
    );
  const initial = await values();
  expect(initial).toHaveLength(4);
  expect((await table.locator('tbody tr').first().boundingBox()).height).toBe(48);
  expect(new Set(initial).size).toBeGreaterThan(1);
  await header.getByRole('button').click();
  await expect(header).toHaveAttribute('aria-sort', 'descending');
  expect(await values()).toEqual([...initial].sort((a, b) => b - a));
  await header.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  expect(await values()).toEqual([...initial].sort((a, b) => a - b));
});
test('свой период получает фокус и сохраняется в ссылке до выбора быстрого периода', async ({
  page,
}) => {
  await login(page);
  const custom = page.getByRole('button', { name: 'Свой', exact: true });
  await custom.click();
  const start = page.getByLabel('Начало периода');
  await expect(start).toBeFocused();
  await start.fill('2020-02-28');
  await page.getByLabel('Конец периода').fill('2020-02-29');
  await expect(page.getByText('За этот период данных нет')).toBeVisible();
  await page.reload();
  await expect(custom).toHaveAttribute('aria-pressed', 'true');
  await expect(start).toHaveValue('2020-02-28');
  const week = page.getByRole('button', { name: '7 дней', exact: true });
  await week.click();
  await expect(week).toHaveAttribute('aria-pressed', 'true');
  await expect(custom).toHaveAttribute('aria-pressed', 'false');
  expect(new URL(page.url()).searchParams.has('period')).toBe(false);
});
test('медленный отчёт сохраняет форму карточек, отзывы показывают строки ожидания', async ({
  page,
}) => {
  await login(page);
  await duringDelay(
    page,
    '**/api/dashboard?**',
    () => select(page, 'Филиал').selectOption('1'),
    async () => {
      await expect(page.getByRole('status')).toContainText('Загрузка данных');
      await expect(page.locator('.loading-card')).toHaveCount(6);
      await expect(page.locator('.loading-chart')).toBeVisible();
    },
  );
  await duringDelay(
    page,
    '**/api/reviews?**',
    () => page.getByRole('link', { name: 'Отзывы', exact: true }).click(),
    async () => {
      await expect(page.getByRole('status')).toContainText('Загрузка отзывов');
      await expect(page.locator('.loading-rows > *')).toHaveCount(3);
    },
  );
});
