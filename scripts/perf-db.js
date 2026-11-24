import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { seed } from './perf-seed.js';
import { benchmark } from './perf-benchmark.js';
const db = new PrismaClient();
const run = async () => {
  const [result] = await db.$queryRaw`SELECT current_database() name`;
  if (result.name !== 'geo_perf')
    throw new Error('Для нагрузочного сида нужна выделенная база geo_perf');
  execFileSync(
    process.execPath,
    [fileURLToPath(import.meta.resolve('prisma/build/index.js')), 'migrate', 'deploy'],
    {
      stdio: 'inherit',
    },
  );
  await seed(db);
  if (process.argv[2] === 'measure') await benchmark(db);
};
run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
