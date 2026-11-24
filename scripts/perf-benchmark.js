import { Prisma } from '@prisma/client';
import { reportSql } from '../apps/api/dist/modules/metrics/metrics.repository.js';
import { reviewSql } from '../apps/api/dist/modules/reviews/reviews.repository.js';
import { AccessScope } from '../apps/api/dist/common/access-scope.js';
import { branchListSql } from '../apps/api/dist/modules/branches/branches.repository.js';
import { performance } from 'node:perf_hooks';
const range = { from: '2026-04-01', to: '2026-04-30' };
const viewer = { role: 'client', login: 'load@example.com', company_id: 25 };
const scope = new AccessScope();
const ids = (filters) =>
  Prisma.sql`SELECT b.id FROM branches b WHERE ${scope.predicate(viewer, filters)}`;
const queries = {
  branches: branchListSql(scope.predicate(viewer, {})),
  dashboard: reportSql(ids({}), range, true),
  reviewPage: reviewSql(ids({ branchId: 245 }), { ...range, limit: 5 }),
  filteredReviews: reviewSql(ids({}), { ...range, limit: 5, rating: 4, status: 'new' }),
};
const indexes = (plan) => [
  ...(plan['Index Name'] ? [plan['Index Name']] : []),
  ...(plan.Plans ?? []).flatMap(indexes),
];
const measure = async (tx, query) => {
  const samples = [];
  let plan;
  for (let i = 0; i < 8; i++) {
    const [row] = await tx.$queryRaw(Prisma.sql`EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) ${query}`);
    const [result] = row['QUERY PLAN'];
    if (i) samples.push(result['Execution Time']);
    plan = result.Plan;
  }
  samples.sort((a, b) => a - b);
  return {
    ms: samples[3],
    plan: process.argv.includes('--plans') ? plan : undefined,
    blocks: plan['Shared Hit Blocks'] + plan['Shared Read Blocks'],
    indexes: [...new Set(indexes(plan))],
  };
};
const profile = async (tx, label) => {
  for (const [name, query] of Object.entries(queries)) {
    const result = await measure(tx, query);
    process.stdout.write(label + ' ' + name + ' ' + JSON.stringify(result) + '\n');
  }
};
const benchmark = async (db) =>
  db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(71043)`;
      await tx.$executeRaw`DROP INDEX IF EXISTS reviews_branch_date_id_idx`;
      await profile(tx, 'before');
      const start = performance.now();
      await tx.$executeRaw`CREATE INDEX reviews_branch_date_id_idx ON reviews(branch_id,created_at DESC,id ASC)`;
      process.stdout.write('index build ms ' + (performance.now() - start).toFixed(2) + '\n');
      await profile(tx, 'after');
    },
    { timeout: 60000 },
  );
export { benchmark };
