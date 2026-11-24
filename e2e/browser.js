import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
const number = new Intl.NumberFormat('ru-RU');
const names = {
  views: 'Просмотры карточек',
  site: 'Переходы на сайт',
  calls: 'Звонки',
  routes: 'Построенные маршруты',
  rating: 'Средний рейтинг',
  reviews: 'Отзывы',
};
let seedDay;
const demoDay = (offset = 0) => {
  if (!seedDay) {
    seedDay = execFileSync(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'db',
        'psql',
        '-U',
        'postgres',
        '-d',
        'geo',
        '-Atc',
        'SELECT max(created_at)::date FROM reviews',
      ],
      { encoding: 'utf8' },
    ).trim();
  }
  return new Date(Date.parse(seedDay) - offset * 86400000).toISOString().slice(0, 10);
};
const pinDemoClock = (page) => page.clock.setFixedTime(new Date(demoDay() + 'T12:00:00Z'));
const shot = async (page, name) => {
  await page.mouse.move(1, 1);
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({
    animations: 'disabled',
    path:
      process.env.ATLAS_CAPTURE === '1'
        ? 'docs/screenshots/' + name + '.png'
        : test.info().outputPath(name + '.png'),
    fullPage: true,
  });
};
const submit = async (page, role = 'client', password = 'Demo-Atlas-42') => {
  await page.getByLabel('Логин').fill(role + '@example.com');
  await page.getByLabel('Пароль').fill(password);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
};
const login = async (page, role = 'client') => {
  await page.goto('/login');
  await submit(page, role);
  await expect(page.locator('article')).toHaveCount(6);
};
const select = (page, name) => page.getByRole('combobox', { name, exact: true });
const cardsMatch = async (page, filters) => {
  const response = await page.request.get('/api/dashboard', { params: filters });
  expect(response.status()).toBe(200);
  const { metrics } = await response.json();
  for (const [key, label] of Object.entries(names)) {
    const card = page.locator('article').filter({ has: page.getByText(label, { exact: true }) });
    await expect(card.locator('strong')).toHaveText(
      metrics[key] === null ? '—' : number.format(metrics[key]),
    );
  }
  return metrics;
};
const cleanScreen = async (page) => {
  await expect(page.locator('body')).not.toContainText(
    /NaN|undefined|Failed to fetch|SyntaxError|ZodError|invalid_type|Unexpected token|Internal Server Error/,
  );
  expect(await page.pageErrors()).toEqual([]);
};
const duringDelay = async (page, url, action, observe) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    url,
    async (route) => {
      await gate;
      await route.continue();
    },
    { times: 1 },
  );
  try {
    await action();
    await observe();
  } finally {
    release();
  }
};
export { demoDay, pinDemoClock, shot, submit, login, select, cardsMatch, cleanScreen, duringDelay };
