import { JwtService } from '@nestjs/jwt';
import { totals, meanRating, difference } from './metric-reference.js';
import { startTestServer } from './test-server.js';
import { install, remove, period, current, previous, series } from './access-data.js';
let server;
beforeAll(async () => {
  server = await startTestServer();
  await install(server.db);
});
afterAll(async () => {
  if (server) {
    try {
      await remove(server.db);
    } finally {
      await server.close();
    }
  }
});
const get = (path, params = {}) =>
  server.api
    .get('/api/' + path)
    .set('Cookie', server.client)
    .query(params);
const post = (path, body) =>
  server.api
    .post('/api/' + path)
    .set('Cookie', server.client)
    .send(body);

test('срок сессии совпадает у JWT и защищённой cookie', () => {
  const [session, ...attributes] = server.client[0].split('; ');
  const claims = new JwtService().decode(session.slice('session='.length));
  expect(claims.exp - claims.iat).toBe(28800);
  expect(attributes).toEqual(
    expect.arrayContaining(['Max-Age=28800', 'Path=/api', 'HttpOnly', 'SameSite=Strict']),
  );
});
test('справочники клиента остаются в его компании при лишнем query', async () => {
  const companies = await get('companies', { companyId: 2 }).expect(200);
  expect(companies.body.map((c) => c.id)).toEqual([1]);
  const branches = await get('branches', { companyId: 2 }).expect(200);
  expect(branches.body.map((b) => [b.id, b.company_id])).toEqual([
    [1, 1],
    [2, 1],
  ]);
});
test.each([
  [1, 200],
  [2, 200],
  [3, 404],
  [4, 404],
  [999, 404],
])('видимость фиксированного филиала %i', async (id, status) => {
  const response = await get('branches/' + id).expect(status);
  if (status === 200) expect(response.body.company_id).toBe(1);
  else expect(response.body).toEqual({ status: 404, message: 'Филиал не найден' });
});
test.each(['dashboard', 'reviews'])(
  '%s одинаково скрывает чужую и отсутствующую запись',
  async (path) => {
    const foreign = await get(path, { ...period, branchId: 3 }).expect(404);
    const missing = await get(path, { ...period, branchId: 999 }).expect(404);
    expect(foreign.body).toEqual(missing.body);
  },
);
test.each(['dashboard', 'reviews'])('%s отклоняет подмену компании', async (path) => {
  await get(path, { ...period, companyId: 2 }).expect(400);
  await get(path, { ...period, company: 2 }).expect(403);
});
test('все филиалы: шесть итогов, прошлый период и каждая точка графика принадлежат A', async () => {
  const report = await get('dashboard', period).expect(200);
  expect(report.body.metrics).toEqual(current);
  expect(report.body.metrics.rating).toBe(meanRating(5 + 5 + 2 + 4, 4));
  expect(difference(report.body.metrics.views, report.body.previous.views)).toBe(47);
  expect(report.body.previous).toEqual(previous);
  expect(report.body.days).toEqual(series);
});
test('выбор одного филиала сужает и итоги, и динамику', async () => {
  const { body } = await get('dashboard', { ...period, branchId: 2 }).expect(200);
  expect(body.metrics).toEqual({ views: 8, site: 1, calls: 2, routes: 4, rating: 2, reviews: 1 });
  expect(body.days).toEqual([{ date: period.from, ...body.metrics }]);
});
test('отзывы содержат все четыре записи A и ни одной записи Б', async () => {
  const { body } = await get('reviews', period).expect(200);
  expect(body.map((r) => r.text).sort()).toEqual(
    ['Первый A', 'Второй A', 'Третий A', 'Четвёртый A'].sort(),
  );
  expect(body.map((r) => r.branch_id).sort()).toEqual([1, 1, 1, 2]);
});
test('администратор может выбрать компанию Б, её данные отличимы от A', async () => {
  const { body } = await server.api
    .get('/api/dashboard')
    .set('Cookie', server.admin)
    .query({ ...period, company: 2 })
    .expect(200);
  expect(body.metrics).toEqual({
    views: 1500,
    site: 1350,
    calls: 1200,
    routes: 1050,
    rating: 1,
    reviews: 2,
  });
  expect(body.days).toHaveLength(2);
});
test('CSV отдаёт только строки текущего периода клиента с шестью показателями', async () => {
  const response = await get('export', period)
    .expect(200)
    .expect('Content-Type', /text\/csv/);
  expect(response.headers['content-disposition']).toContain('attachment');
  expect(
    response.text
      .replace(/^\uFEFF/, '')
      .trimEnd()
      .split('\r\n'),
  ).toEqual([
    'Дата,Просмотры карточек,Переходы на сайт,Звонки,Построенные маршруты,Средний рейтинг,Отзывы',
    '2031-06-10,20,5,3,7,4,3',
    '2031-06-11,30,9,4,8,4,1',
  ]);
});
test('CSV использует область доступа и проверку филиала отчёта', async () => {
  await get('export', { ...period, branchId: 3 }).expect(404);
  await get('export', { ...period, companyId: 2 }).expect(400);
  await get('export', { ...period, company: 2 }).expect(403);
  await server.api.get('/api/export').query(period).expect(401);
  const { text } = await server.api
    .get('/api/export')
    .set('Cookie', server.admin)
    .query({ ...period, company: 2 })
    .expect(200);
  expect(text).toContain('2031-06-11,1000,900,800,700,1,1');
});
test('CSV при пустом периоде содержит только заголовок', async () => {
  const { text } = await get('export', { from: '2090-01-01', to: '2090-01-02' }).expect(200);
  expect(text.trim().split('\r\n')).toHaveLength(1);
  expect(text).toContain('Средний рейтинг');
});
test('клиентский запрос импорта с чужим филиалом и полями прав ничего не записывает', async () => {
  const where = { branch_id: 3, date_from: new Date(period.from), date_to: new Date(period.to) };
  const runs = () => server.db.importRun.count({ where });
  const before = await runs();
  const input = { ...period, branchId: 3 };
  await post('imports', input).expect(403);
  await post('imports', { ...input, companyId: 2, role: 'admin' }).expect(403);
  expect(await runs()).toBe(before);
  const { body } = await get('dashboard', period);
  expect(body.metrics).toEqual(current);
});
test('поля прав в форме входа не выдают сессию', async () => {
  const response = await post('login', {
    login: 'client@example.com',
    password: 'Demo-Atlas-42',
    companyId: 2,
    role: 'admin',
  }).expect(400);
  expect(response.headers['set-cookie']).toBeUndefined();
});
test.each(['me', 'companies', 'branches', 'branches/3', 'dashboard', 'reviews'])(
  'GET %s требует сессию',
  async (path) => {
    await server.api
      .get('/api/' + path)
      .query(period)
      .expect(401);
  },
);
test('POST imports требует сессию', async () => {
  await server.api
    .post('/api/imports')
    .send({ ...period, branchId: 3 })
    .expect(401);
});
test('период свыше 32 бит даёт точную сумму и сохраняет дневные значения', async () => {
  const dates = ['2032-01-15', '2032-01-16'];
  const rows = dates.map((date) => ({
    branch_id: 2,
    date: new Date(date),
    views: 2_000_000_000,
    site: 15,
    calls: 8,
    routes: 20,
  }));
  const where = { branch_id: 2, date: { in: rows.map((r) => r.date) } };
  try {
    await server.db.$transaction([
      server.db.dailyMetric.deleteMany({ where }),
      server.db.dailyMetric.createMany({ data: rows }),
    ]);
    const { body } = await get('dashboard', { from: dates[0], to: dates[1], branchId: 2 }).expect(
      200,
    );
    expect(body.metrics).toEqual({ ...totals(rows), rating: null, reviews: 0 });
    expect(body.days.map((d) => d.views)).toEqual([2_000_000_000, 2_000_000_000]);
  } finally {
    await server.db.dailyMetric.deleteMany({ where });
  }
});
test('персональный отчёт запрещено сохранять общему HTTP-кешу', async () => {
  const response = await get('dashboard', period).expect(200);
  expect(response.headers['cache-control']).toBe('no-store');
});
const feedbackId = async (text) =>
  (
    await server.db.review.findFirstOrThrow({
      where: { author: 'Демо • тест области доступа', text },
    })
  ).id;
const patchStatus = (id, status, cookie = server.client) =>
  server.api
    .patch('/api/reviews/' + id)
    .set('Cookie', cookie)
    .send({ status });
test('страницы отзывов проходят все даты и совпадающие времена без повторов', async () => {
  const first = await get('reviews', { ...period, limit: 2 }).expect(200);
  const next = await get('reviews', {
    ...period,
    limit: 2,
    cursor: first.headers['x-next-cursor'],
  }).expect(200);
  expect([...first.body, ...next.body].map((r) => r.text)).toEqual([
    'Четвёртый A',
    'Первый A',
    'Второй A',
    'Третий A',
  ]);
  expect(next.headers['x-next-cursor']).toBeUndefined();
});
test('рейтинг и статус применяются вместе, статус сохраняется в базе', async () => {
  const id = await feedbackId('Первый A');
  try {
    await patchStatus(id, 'in_progress').expect(200, { id, status: 'in_progress' });
    const found = await get('reviews', { ...period, rating: 5, status: 'in_progress' }).expect(200);
    expect(found.body.map((r) => r.id)).toEqual([id]);
    expect((await get('reviews', { ...period, rating: 2, status: 'in_progress' })).body).toEqual(
      [],
    );
    expect((await server.db.review.findUniqueOrThrow({ where: { id } })).status).toBe(
      'in_progress',
    );
  } finally {
    await patchStatus(id, 'new').expect(200);
  }
});
test('чужой и отсутствующий отзывы при изменении одинаково скрыты', async () => {
  const id = await feedbackId('Первый Б');
  const foreign = await patchStatus(id, 'resolved').expect(404);
  const missing = await patchStatus(2147483647, 'resolved').expect(404);
  expect(foreign.body).toEqual(missing.body);
  expect((await server.db.review.findUniqueOrThrow({ where: { id } })).status).toBe('new');
});
test('таблица филиалов содержит точные показатели каждого доступного филиала', async () => {
  const { body } = await get('dashboard', period).expect(200);
  expect(body.branches).toEqual([
    { branchId: 1, views: 42, site: 13, calls: 5, routes: 11, rating: 4.7, reviews: 3 },
    { branchId: 2, views: 8, site: 1, calls: 2, routes: 4, rating: 2, reviews: 1 },
  ]);
  const one = await get('dashboard', { ...period, branchId: 2 }).expect(200);
  expect(one.body.branches).toEqual([body.branches[1]]);
});
