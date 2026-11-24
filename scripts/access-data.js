const period = { from: '2031-06-10', to: '2031-06-11' };
const day = (n) => new Date(Date.UTC(2031, 5, n));
const samples = [
  [1, 9, 3, 1, 1, 0],
  [3, 9, 800, 700, 600, 500],
  [1, 10, 12, 4, 1, 3],
  [2, 10, 8, 1, 2, 4],
  [3, 10, 500, 450, 400, 350],
  [1, 11, 30, 9, 4, 8],
  [4, 11, 1000, 900, 800, 700],
].map(([branch_id, n, views, site, calls, routes]) => ({
  branch_id,
  date: day(n),
  views,
  site,
  calls,
  routes,
}));
const feedback = [
  [1, 9, 3, 'Вчера A'],
  [3, 9, 1, 'Вчера Б'],
  [1, 10, 5, 'Первый A'],
  [1, 10, 5, 'Второй A'],
  [2, 10, 2, 'Третий A'],
  [3, 10, 1, 'Первый Б'],
  [1, 11, 4, 'Четвёртый A'],
  [4, 11, 1, 'Второй Б'],
].map(([branch_id, n, rating, text]) => ({
  branch_id,
  created_at: day(n),
  rating,
  text,
  status: 'new',
  author: 'Демо • тест области доступа',
}));
const clear = (tx) => [
  tx.dailyMetric.deleteMany({
    where: { OR: samples.map(({ branch_id, date }) => ({ branch_id, date })) },
  }),
  tx.review.deleteMany({ where: { author: 'Демо • тест области доступа' } }),
];
const install = async (db) =>
  db.$transaction([
    ...clear(db),
    db.dailyMetric.createMany({ data: samples }),
    db.review.createMany({ data: feedback }),
  ]);
const remove = async (db) => db.$transaction(clear(db));
const current = { views: 50, site: 14, calls: 7, routes: 15, rating: 4, reviews: 4 };
const previous = { views: 3, site: 1, calls: 1, routes: 0, rating: 3, reviews: 1 };
const series = [
  { date: period.from, views: 20, site: 5, calls: 3, routes: 7, rating: 4, reviews: 3 },
  { date: period.to, views: 30, site: 9, calls: 4, routes: 8, rating: 4, reviews: 1 },
];
export { install, remove, period, current, previous, series };
