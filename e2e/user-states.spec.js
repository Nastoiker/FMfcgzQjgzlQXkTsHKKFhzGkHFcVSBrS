import { submitWrongPassword } from './password-fixture.js';
import { test, expect } from '@playwright/test';
import {
  demoDay,
  pinDemoClock,
  submit,
  login,
  select,
  cardsMatch,
  cleanScreen,
  duringDelay,
} from './browser.js';
test.beforeEach(async ({ page }) => pinDemoClock(page));
test('неверный пароль и возврат к ссылке после входа', async ({ page }) => {
  const next = new URLSearchParams({ branchId: '1', from: demoDay(4), to: demoDay() });
  await page.goto('/?' + next.toString());
  await expect(page.getByLabel('Пароль')).toBeVisible();
  await submitWrongPassword(page);
  await expect(page.getByRole('alert')).toHaveText('Неверный логин или пароль');
  await duringDelay(
    page,
    '**/api/login',
    () => submit(page),
    () => expect(page.getByRole('button', { name: 'Входим…' })).toBeDisabled(),
  );
  await expect(select(page, 'Филиал')).toHaveValue('1');
  await cardsMatch(page, Object.fromEntries(next));
  await cleanScreen(page);
});
test('медленные справочники и запрос отчёта имеют состояния ожидания', async ({ page }) => {
  await page.goto('/login');
  await duringDelay(
    page,
    '**/api/branches',
    () => submit(page),
    () => expect(page.getByText('Загрузка филиалов…')).toBeVisible(),
  );
  await expect(page.locator('article')).toHaveCount(6);
  await duringDelay(
    page,
    '**/api/dashboard?**',
    () => select(page, 'Филиал').selectOption('2'),
    () => expect(page.getByText('Загрузка данных…')).toBeVisible(),
  );
  await cardsMatch(page, { branchId: 2, from: demoDay(29), to: demoDay() });
  await cleanScreen(page);
});
const failures = [
  [
    'ошибка сервера',
    (route) =>
      route.fulfill({ status: 503, body: 'Internal Server Error: private upstream details' }),
    'Не удалось выполнить запрос',
  ],
  ['сбой сети', (route) => route.abort('failed'), 'Нет связи с сервером'],
  [
    'нечитаемый JSON',
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{' }),
    'Не удалось прочитать ответ сервера',
  ],
  [
    'неполный отчёт',
    (route) => route.fulfill({ json: { metrics: { views: 15 } } }),
    'Сервер прислал неполные данные',
  ],
];
for (const [title, fail, message] of failures) {
  test(title + ' — сообщение по-русски и повтор', async ({ page }) => {
    await login(page);
    await page.route('**/api/dashboard?**', fail, { times: 1 });
    await select(page, 'Филиал').selectOption('1');
    await expect(page.getByRole('alert')).toContainText(message);
    await cleanScreen(page);
    await page.getByRole('button', { name: 'Повторить' }).click();
    await cardsMatch(page, { from: demoDay(29), to: demoDay(), branchId: 1 });
    await cleanScreen(page);
  });
}
test('пустой период и день без рейтинга объясняются отдельно', async ({ page }) => {
  await login(page);
  await page.getByLabel('Конец периода').fill('2090-05-02');
  await expect(page.getByText('Выберите период от 1 до 366 дней.')).toBeVisible();
  await page.getByLabel('Начало периода').fill('2090-05-01');
  await expect(page.getByText('За этот период данных нет')).toBeVisible();
  const periods = page.getByRole('navigation', { name: 'Быстрый период' });
  await expect(periods.getByRole('button', { pressed: true })).toHaveText('Свой');
  await expect(periods.getByRole('button', { name: /дней$/, pressed: false })).toHaveCount(3);
  await cardsMatch(page, { from: '2090-05-01', to: '2090-05-02' });
  await cleanScreen(page);
  const date = demoDay(65);
  await page.goto('/?branchId=1&from=' + date + '&to=' + date + '&metric=rating');
  await expect(page.getByText('За этот период нет оценок')).toBeVisible();
  await select(page, 'Показатель').selectOption('views');
  await expect(
    page
      .getByRole('region', { name: 'Динамика: Просмотры карточек' })
      .locator('svg.recharts-surface')
      .first(),
  ).toBeVisible();
});
test('каталог восстанавливается после ошибки и объясняет отсутствие филиалов', async ({ page }) => {
  await page.route('**/api/branches', (r) => r.fulfill({ status: 503 }), { times: 1 });
  await page.goto('/login');
  await submit(page);
  await expect(page.getByRole('alert')).toContainText('Не удалось получить филиалы');
  await page.route('**/api/branches', (r) => r.fulfill({ json: [] }), { times: 1 });
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByText('Нет доступных филиалов')).toBeVisible();
  await expect(page.locator('article')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('article')).toHaveCount(6);
});
test('администратор может повторить импорт и видит пустой ответ источника', async ({ page }) => {
  await login(page, 'admin');
  await select(page, 'Филиал').selectOption('4');
  const button = page.getByRole('button', { name: 'Импортировать за период' });
  await page.route('**/api/imports', (r) => r.fulfill({ status: 502 }), { times: 1 });
  await button.click();
  await expect(page.getByRole('alert')).toContainText('Источник временно недоступен');
  await page.route('**/api/imports', (r) => r.fulfill({ json: { rows: 0 } }), { times: 1 });
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByText('Источник не вернул данных за этот период.')).toBeVisible();
  await cleanScreen(page);
});
test('смена аккаунта в соседней вкладке убирает данные администратора', async ({
  page,
  context,
}) => {
  await login(page, 'admin');
  await select(page, 'Филиал').selectOption('3');
  const other = await context.newPage();
  await login(other);
  await expect(page.getByText('Филиал не найден')).toBeVisible();
  await expect(page.locator('article')).toHaveCount(0);
  await expect(select(page, 'Компания')).toHaveCount(0);
  await other.getByRole('button', { name: 'Выйти' }).click();
  await expect(page.getByLabel('Пароль')).toBeVisible();
});
test('один филиал на экране телефона помещается по ширине', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await select(page, 'Филиал').selectOption('1');
  await cardsMatch(page, { branchId: 1, from: demoDay(29), to: demoDay() });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await cleanScreen(page);
});
test('клиент возвращается к своим филиалам из ссылки с фильтром компании', async ({ page }) => {
  await login(page);
  await page.goto('/?company=2');
  await expect(page.getByText('Выбор компании доступен администратору.')).toBeVisible();
  await expect(page.locator('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Мои филиалы' }).click();
  await cardsMatch(page, { from: demoDay(29), to: demoDay() });
});
test('ошибка загрузки сессии и справочника компаний имеет рабочий повтор', async ({ page }) => {
  await login(page, 'admin');
  await page.route('**/api/me', (r) => r.fulfill({ status: 503 }), { times: 1 });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Не удалось выполнить запрос');
  await page.route('**/api/companies', (r) => r.fulfill({ status: 503 }), { times: 1 });
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось получить компании');
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(select(page, 'Компания').locator('option')).toHaveCount(3);
  await cleanScreen(page);
});
