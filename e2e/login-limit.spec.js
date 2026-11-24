import { test, expect } from '@playwright/test';
import { submit } from './browser.js';
test('форма входа объясняет ограничение и время ожидания', async ({ page }) => {
  await page.route(
    '**/api/login',
    (r) => r.fulfill({ status: 429, headers: { 'Retry-After': '75' } }),
    { times: 1 },
  );
  await page.goto('/login');
  await submit(page);
  await expect(page.getByRole('alert')).toHaveText(
    'Слишком много попыток. Повторите вход через 2 мин.',
  );
  await expect(page.getByLabel('Пароль')).not.toHaveAttribute('aria-invalid', 'true');
  await submit(page);
  await expect(page.locator('article')).toHaveCount(6);
});
