import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import supertest from 'supertest';
import { createServer } from 'node:http';
import demoSource from './provider.js';

const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));

const startTestServer = async () => {
  const port = process.env.TEST_DB_PORT || '55439';
  if (!/^\d{1,5}$/.test(port)) throw new Error('Некорректный порт тестовой БД');
  process.env.DATABASE_URL = 'postgres://postgres:demo@127.0.0.1:' + port + '/geo_test';
  const options = { env: { ...process.env } };
  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], options);
  execFileSync(process.execPath, ['prisma/seed.js'], options);
  let source = demoSource;
  const provider = createServer((req, res) => source(req, res));
  await new Promise((resolve) => provider.listen(0, '127.0.0.1', resolve));
  process.env.PROVIDER_URL = 'http://127.0.0.1:' + provider.address().port;
  const { db } = await import('../apps/api/dist/common/database.js');
  const { createApp } = await import('../apps/api/dist/app.js');
  const app = await createApp();
  const api = supertest((await app.init()).getHttpServer());
  const cookie = async (login) =>
    (await api.post('/api/login').send({ login, password: 'Demo-Atlas-42' }).expect(201)).headers[
      'set-cookie'
    ];
  const close = async () => {
    await app.close();
    provider.closeAllConnections();
    await new Promise((resolve) => provider.close(resolve));
    await db.$disconnect();
  };
  return {
    api,
    db,
    setSource(handler = demoSource) {
      source = handler;
    },
    client: await cookie('client@example.com'),
    admin: await cookie('admin@example.com'),
    close,
  };
};
export { startTestServer };
