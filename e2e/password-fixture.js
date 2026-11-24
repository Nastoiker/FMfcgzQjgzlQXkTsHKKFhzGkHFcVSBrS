import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { submit } from './browser.js';

const sql = (statement, name, key) =>
  execFileSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'db',
      'psql',
      '-X',
      '-q',
      '-U',
      'postgres',
      '-d',
      'geo',
      '-v',
      'ON_ERROR_STOP=1',
      '-v',
      'name=' + name,
      '-v',
      'key=' + key,
    ],
    { input: statement, encoding: 'utf8' },
  );
// Ошибочные входы браузерных тестов не должны расходовать лимит демопользователя.
const submitWrongPassword = async (page) => {
  const alias = 'browser-' + randomUUID();
  const name = alias + '@example.com';
  const key = createHash('sha256').update(name).digest('hex');
  sql(
    "INSERT INTO users(login,password,role,company_id) SELECT :'name',password,role,company_id FROM users WHERE login='client@example.com';",
    name,
    key,
  );
  try {
    const response = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/login');
    await submit(page, alias, 'ошибка');
    expect((await response).status()).toBe(401);
  } finally {
    sql(
      "BEGIN; DELETE FROM login_windows WHERE key=:'key'; DELETE FROM users WHERE login=:'name'; COMMIT;",
      name,
      key,
    );
  }
};
export { submitWrongPassword };
