import { jest } from '@jest/globals';
import { previousPeriod, chartDays } from '../apps/api/dist/modules/metrics/metrics.lib.js';
import { startTestServer } from './test-server.js';
import { totals, meanRating, difference } from './metric-reference.js';
let api, db, client, admin, close, setSource;
const date = new Date().toISOString().slice(0, 10);
const period = { from: date, to: date };
beforeAll(async () => {
  ({ api, db, client, admin, close, setSource } = await startTestServer());
});
afterAll(async () => {
  await close?.();
});
test('без сессии 401', () => api.get('/api/branches').expect(401));
test('изоляция компаний', async () => {
  const get = (path) => api.get('/api/' + path).set('Cookie', client);
  expect((await get('branches')).body.map((b) => b.id)).toEqual([1, 2]);
  expect((await get('reviews').query({ from: '2000-01-01', to: '2000-01-02' })).body).toEqual([]);
  const recent = await db.review.findFirstOrThrow({ orderBy: { created_at: 'desc' } });
  const reviewDay = recent.created_at.toISOString().slice(0, 10);
  const reviews = (await get('reviews').query({ from: reviewDay, to: reviewDay })).body;
  expect(reviews.length).toBeGreaterThan(0);
  expect(reviews.every((r) => [1, 2].includes(r.branch_id))).toBe(true);
  await api
    .post('/api/login')
    .send({ login: 'client', password: 'Demo-Atlas-42', companyId: 2 })
    .expect(400);
  await get('branches/3').expect(404);
  for (const path of ['dashboard', 'reviews'])
    await get(path)
      .query({ ...period, branchId: 3 })
      .expect(404);
  await get('dashboard')
    .query({ ...period, companyId: 2 })
    .expect(400);
  const own = await db.dailyMetric.aggregate({
    where: { branch_id: { in: [1, 2] }, date: new Date(date) },
    _sum: { views: true },
  });
  expect((await get('dashboard').query(period)).body.metrics.views).toBe(Number(own._sum.views));
  await api
    .post('/api/imports')
    .set('Cookie', client)
    .send({ ...period, branchId: 1 })
    .expect(403);
});
test('администратор видит обе компании', async () =>
  expect((await api.get('/api/branches').set('Cookie', admin)).body.map((b) => b.id)).toEqual([
    1, 2, 3, 4,
  ]));
test('повтор импорта сохраняет результат и число строк', async () => {
  const p = { from: '2020-04-01', to: '2020-04-04', branchId: 1 };
  const run = () => api.post('/api/imports').set('Cookie', admin).send(p).expect(201, { rows: 4 });
  const read = () =>
    db.dailyMetric.findMany({
      where: { branch_id: 1, date: { gte: new Date(p.from), lte: new Date(p.to) } },
      orderBy: { date: 'asc' },
    });
  await db.dailyMetric.deleteMany({
    where: { branch_id: 1, date: { gte: new Date(p.from), lte: new Date(p.to) } },
  });
  await run();
  const first = await read();
  expect(first).toHaveLength(4);
  await run();
  expect(await read()).toEqual(first);
});
test('суммы, рейтинг и разница периодов', () => {
  const d = { views: 2, site: 3, calls: 4, routes: 5 };
  expect(totals([d, d])).toEqual({ views: 4, site: 6, calls: 8, routes: 10 });
  expect(meanRating(14, 3)).toBe(4.7);
  expect(meanRating(0, 0)).toBeNull();
  expect(difference(5, 7)).toBe(-2);
});
test('равный предыдущий период и упорядоченные дни', () => {
  expect(previousPeriod('2024-03-01', '2024-03-01')).toEqual({
    from: '2024-02-29',
    to: '2024-02-29',
  });
  expect(chartDays([{ date: '2025-01-02' }, { date: '2025-01-01' }]).map((d) => d.date)).toEqual([
    '2025-01-01',
    '2025-01-02',
  ]);
  expect(totals([]).views).toBe(0);
});
test.each([
  [429, 2],
  [500, 2],
  [400, 1],
])('ответ источника %i и число попыток', async (status, count) => {
  const fake = jest
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response('', { status }))
    .mockResolvedValue(new Response('[]'));
  try {
    await api
      .post('/api/imports')
      .set('Cookie', admin)
      .send({ ...period, branchId: 1 })
      .expect(status === 400 ? 502 : 201);
    expect(fake).toHaveBeenCalledTimes(count);
    const latest = await db.importRun.findFirst({ orderBy: { id: 'desc' } });
    expect(latest.attempts).toBe(count);
  } finally {
    fake.mockRestore();
  }
});
test('новая версия дня заменяет прежнюю без дубля', async () => {
  const date = '2033-03-05',
    query = { branchId: 1, from: date, to: date };
  const where = { branch_id: 1, date: new Date(date) };
  let views = 12;
  setSource((_request, response) =>
    response.end(JSON.stringify([{ branch_id: 1, date, views, site: 2, calls: 1, routes: 4 }])),
  );
  const run = () =>
    api.post('/api/imports').set('Cookie', admin).send(query).expect(201, { rows: 1 });
  try {
    await db.dailyMetric.deleteMany({ where });
    await run();
    views = 41;
    await run();
    const saved = await db.dailyMetric.findMany({ where });
    expect(saved).toHaveLength(1);
    expect(saved[0].views).toBe(41);
  } finally {
    setSource();
    await db.dailyMetric.deleteMany({ where });
  }
});
test('таймаут реального HTTP-источника повторяется и записывается в журнал', async () => {
  let calls = 0;
  setSource((_request, res) => {
    calls++;
    if (calls === 1) setTimeout(() => res.end('[]'), 850);
    else res.end('[]');
  });
  try {
    await api
      .post('/api/imports')
      .set('Cookie', admin)
      .send({ ...period, branchId: 1 })
      .expect(201, { rows: 0 });
    expect(calls).toBe(2);
    const run = await db.importRun.findFirstOrThrow({ orderBy: { id: 'desc' } });
    expect(run.attempts).toBe(2);
    expect(run.status).toBe('success');
  } finally {
    setSource();
  }
});
test('постоянная ошибка содержимого сохраняет причину и не меняет метрики', async () => {
  const q = { branchId: 2, from: '2030-02-10', to: '2030-02-10' };
  const where = { branch_id: 2, date: new Date(q.from) };
  const before = await db.dailyMetric.findMany({ where });
  setSource((_request, res) => res.end('{"not":"daily rows"}'));
  try {
    await api.post('/api/imports').set('Cookie', admin).send(q).expect(502);
    expect(await db.dailyMetric.findMany({ where })).toEqual(before);
    const event = await db.importRun.findFirstOrThrow({ orderBy: { id: 'desc' } });
    expect(event).toMatchObject({
      status: 'failed',
      attempts: 1,
      rows: 0,
      error: 'Неверный формат данных',
    });
  } finally {
    setSource();
  }
});
