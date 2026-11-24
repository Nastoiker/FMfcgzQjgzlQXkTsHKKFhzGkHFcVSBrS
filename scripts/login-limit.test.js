import { createHash } from 'node:crypto';
import { startTestServer } from './test-server.js';
const login = 'limit-fixture@example.com';
const key = createHash('sha256').update(login).digest('hex');
let server;
beforeAll(async () => {
  server = await startTestServer();
  const { password } = await server.db.user.findUniqueOrThrow({
    where: { login: 'client@example.com' },
  });
  const data = { login, password, role: 'client', company_id: 1 };
  await server.db.user.upsert({ where: { login }, create: data, update: data });
});
afterAll(async () => {
  if (!server) return;
  try {
    await server.db.loginWindow.deleteMany({ where: { key } });
    await server.db.user.deleteMany({ where: { login } });
  } finally {
    await server.close();
  }
});
const enter = (password, name = login) =>
  server.api.post('/api/login').send({ login: name, password });
test('параллельные попытки одного логина делят пять мест до истечения окна', async () => {
  await server.db.loginWindow.deleteMany({ where: { key } });
  const attempts = await Promise.all(
    Array.from({ length: 6 }, () => enter('неверно', 'limit-fixture')),
  );
  expect(attempts.map((r) => r.status).sort()).toEqual([401, 401, 401, 401, 401, 429]);
  const denied = await enter('Demo-Atlas-42').expect(429);
  expect(Number(denied.headers['retry-after'])).toBeGreaterThan(0);
  expect(Number(denied.headers['retry-after'])).toBeLessThanOrEqual(600);
  expect(denied.headers['set-cookie']).toBeUndefined();
  await enter('Demo-Atlas-42', 'client@example.com').expect(201);
  await server.db.loginWindow.update({ where: { key }, data: { expires_at: new Date(0) } });
  await enter('Demo-Atlas-42').expect(201);
});
test('успешные входы освобождают зарезервированное место', async () => {
  await server.db.loginWindow.deleteMany({ where: { key } });
  for (let n = 0; n < 6; n++) await enter('Demo-Atlas-42').expect(201);
  expect((await server.db.loginWindow.findUniqueOrThrow({ where: { key } })).attempts).toBe(0);
});
