import { startTestServer } from './test-server.js';
import { install, remove, period } from './access-data.js';
const login = 'client-b-fixture@example.com';
let server, clientB, recordA, recordB;
beforeAll(async () => {
  server = await startTestServer();
  await install(server.db);
  const { password } = await server.db.user.findUniqueOrThrow({
    where: { login: 'client@example.com' },
  });
  const data = { login, role: 'client', company_id: 2, password };
  await server.db.user.upsert({ where: { login }, create: data, update: data });
  const session = await server.api
    .post('/api/login')
    .send({ login, password: 'Demo-Atlas-42' })
    .expect(201);
  clientB = session.headers['set-cookie'];
  const find = (text) =>
    server.db.review.findFirstOrThrow({ where: { author: 'Демо • тест области доступа', text } });
  [recordA, recordB] = await Promise.all([find('Первый A'), find('Первый Б')]);
});
afterAll(async () => {
  if (!server) return;
  try {
    await remove(server.db);
    await server.db.user.deleteMany({ where: { login } });
  } finally {
    await server.close();
  }
});
const read = (cookie, path, query = {}) =>
  server.api
    .get('/api/' + path)
    .set('Cookie', cookie)
    .query(query);
const write = (id) => server.api.patch('/api/reviews/' + id);
const stored = (id) => server.db.review.findUniqueOrThrow({ where: { id } });
test('второй клиент получает в справочнике только собственные филиалы', async () => {
  const { body } = await read(clientB, 'branches').expect(200);
  expect(body.map((b) => [b.id, b.company_id])).toEqual([
    [3, 2],
    [4, 2],
  ]);
});
test('сводка второго клиента использует только его даты и числа', async () => {
  const { body } = await read(clientB, 'dashboard', period).expect(200);
  expect(body.metrics).toEqual({
    views: 1500,
    site: 1350,
    calls: 1200,
    routes: 1050,
    rating: 1,
    reviews: 2,
  });
  expect(body.days.map((d) => d.views)).toEqual([500, 1000]);
  expect(body.previous.views).toBe(800);
});
test('второй клиент видит только свои оценки при комбинированных фильтрах', async () => {
  const { body } = await read(clientB, 'reviews', { ...period, rating: 1, status: 'new' }).expect(
    200,
  );
  expect(body.map((r) => r.text)).toEqual(['Второй Б', 'Первый Б']);
});
test('второй клиент не меняет статус отзыва первого', async () => {
  await write(recordA.id).set('Cookie', clientB).send({ status: 'in_progress' }).expect(404);
  expect(await stored(recordA.id)).toEqual(recordA);
});
test('чужой курсор даёт тот же результат, что и отсутствующий', async () => {
  const page = (cursor) =>
    read(server.client, 'reviews', { ...period, cursor, limit: 1 }).expect(200);
  const foreign = await page(recordB.id),
    missing = await page(2147483647);
  expect(foreign.body).toEqual([]);
  expect(foreign.body).toEqual(missing.body);
  expect(foreign.headers['x-next-cursor']).toBeUndefined();
});
test('изменение отзыва требует действующей сессии', async () => {
  await write(recordA.id).send({ status: 'resolved' }).expect(401);
  expect(await stored(recordA.id)).toEqual(recordA);
});
test('административный фильтр компании закрыт даже для собственной компании клиента', async () => {
  await read(clientB, 'reviews', { ...period, company: 2, status: 'new' }).expect(403);
});
test('операция смены статуса не переносит отзыв в другую компанию', async () => {
  await write(recordA.id)
    .set('Cookie', server.client)
    .send({ status: 'resolved', branchId: 3 })
    .expect(400);
  expect(await stored(recordA.id)).toEqual(recordA);
});
test('второй клиент не запускает административный импорт даже в свой филиал', async () => {
  const where = { branch_id: 3, date_from: new Date(period.from), date_to: new Date(period.to) };
  const before = await server.db.importRun.count({ where });
  await server.api
    .post('/api/imports')
    .set('Cookie', clientB)
    .send({ ...period, branchId: 3 })
    .expect(403);
  expect(await server.db.importRun.count({ where })).toBe(before);
});
test('филиал вне выбранной администратором компании скрыт и в списке отзывов', async () => {
  const { body } = await read(server.admin, 'reviews', {
    ...period,
    company: 1,
    branchId: 3,
  }).expect(404);
  expect(body).toEqual({ status: 404, message: 'Филиал не найден' });
});
