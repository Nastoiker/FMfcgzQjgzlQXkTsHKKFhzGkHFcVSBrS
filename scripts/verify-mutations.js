import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const verify = (file, before, after, test, expected) => {
  const path = 'apps/api/dist/' + file + '.js';
  const original = fs.readFileSync(path, 'utf8');
  if (!original.includes(before)) throw new Error('Сборка не соответствует проверке ' + file);
  try {
    fs.writeFileSync(path, original.replace(before, after));
    const result = spawnSync(
      process.execPath,
      [
        '--experimental-vm-modules',
        fileURLToPath(import.meta.resolve('jest/bin/jest')),
        '--runInBand',
        '-t',
        test,
      ],
      { encoding: 'utf8' },
    );
    const output = result.stdout + result.stderr;
    const failure = /Tests:\s+(\d+) failed/.exec(output);
    if (result.status !== 1 || failure?.[1] !== '1' || !expected.test(output))
      throw new Error(output);
    process.stdout.write(test + ' — ' + failure[1] + ' failed (ожидаемое падение)\n');
  } finally {
    fs.writeFileSync(path, original);
  }
};
verify(
  'common/access-scope',
  'b.company_id=${companyId}',
  'TRUE',
  'изоляция компаний',
  /Received[\s\S]*\+\s+3,/,
);
verify(
  'modules/imports/imports.repository',
  ' ON CONFLICT (branch_id,date) DO UPDATE SET views=excluded.views,site=excluded.site,calls=excluded.calls,routes=excluded.routes',
  '',
  'повтор импорта',
  /expected 201.*got 502/i,
);
verify(
  'modules/metrics/metrics.repository',
  'COALESCE(SUM(site),0)::float8 site',
  'COALESCE(SUM(calls),0)::float8 site',
  'все филиалы: шесть итогов',
  /"site": 7/,
);
verify(
  'modules/imports/imports.repository',
  'DO UPDATE SET views=excluded.views,site=excluded.site,calls=excluded.calls,routes=excluded.routes',
  'DO NOTHING',
  'новая версия дня',
  /Received: 12/,
);
verify(
  'modules/reviews/reviews.repository',
  'AND r.id = ${id} AND ${predicate}',
  'AND r.id = ${id}',
  'чужой и отсутствующий отзывы при изменении',
  /expected 404.*got 200/i,
);
verify(
  'modules/metrics/metrics.service',
  '[d.date, d.views, d.site, d.calls, d.routes, d.rating, d.reviews]',
  '[d.date, d.views, d.calls, d.site, d.routes, d.rating, d.reviews]',
  'CSV отдаёт только строки',
  /2031-06-10,20,3,5,7/,
);
verify(
  'modules/auth/login-attempts.repository',
  'const maximum = 5;',
  'const maximum = 6;',
  'параллельные попытки одного логина',
  /-\s+429,/,
);
