import assert from 'node:assert/strict';
const seed = async (db) => {
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(71043)`;
    await tx.$executeRaw`INSERT INTO companies (id,name)
      SELECT c, 'Компания ' || c FROM generate_series(1,50) c ON CONFLICT (id) DO NOTHING`;
    await tx.$executeRaw`INSERT INTO branches (id,company_id,name)
      SELECT b, 1+(b-1)/10, 'Филиал ' || b FROM generate_series(1,500) b ON CONFLICT (id) DO NOTHING`;
    await tx.$executeRaw`INSERT INTO daily_metrics (branch_id,date,views,site,calls,routes)
      SELECT b, DATE '2026-01-01'+d, 95+(b%29)+(d%17), 12+d%11, 3+b%5, 6+d%9
      FROM generate_series(1,500) b CROSS JOIN generate_series(0,119) d
      ON CONFLICT(branch_id,date) DO NOTHING`;
    await tx.$executeRaw`INSERT INTO reviews (id,branch_id,created_at,rating,status,text,author)
      SELECT (b-1)*120+d+1,b,TIMESTAMPTZ '2026-01-01 12:00:00+00'+d*INTERVAL '1 day',
      1+(b+d)%5,(ARRAY['new','in_progress','resolved'])[1+(b+d)%3],
      'Учебный отзыв '||d,'Гость '||b FROM generate_series(1,500) b CROSS JOIN generate_series(0,119) d
      ON CONFLICT(id) DO NOTHING`;
  });
  await db.$executeRaw`ANALYZE branches`;
  await db.$executeRaw`ANALYZE daily_metrics`;
  await db.$executeRaw`ANALYZE reviews`;
  const [counts] = await db.$queryRaw`SELECT (SELECT count(*)::int FROM companies) companies,
    (SELECT count(*)::int FROM branches) branches,(SELECT count(*)::int FROM daily_metrics) days,
    (SELECT count(*)::int FROM reviews) reviews`;
  assert.deepEqual(counts, { companies: 50, branches: 500, days: 60000, reviews: 60000 });
  process.stdout.write('seed ' + JSON.stringify(counts) + '\n');
};
export { seed };
