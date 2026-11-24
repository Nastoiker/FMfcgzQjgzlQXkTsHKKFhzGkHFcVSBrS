import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const base = process.env.BASE_URL || 'http://127.0.0.1:' + (process.env.WEB_PORT || '5173');
const call = async (
  path,
  status,
  cookie = '',
  body,
  method = body === undefined ? 'GET' : 'POST',
) => {
  const res = await fetch(base + '/api/' + path, {
    method,
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  assert.equal(res.status, status, path);
  return res;
};
const login = async (login) =>
  (
    await call('login', 201, '', { login: login + '@example.com', password: 'Demo-Atlas-42' })
  ).headers
    .get('set-cookie')
    .split(';')[0];
const range = 'from=2020-01-01&to=2020-01-03';
const verifyReads = async (client, admin) => {
  await call('me', 401);
  await call('me', 200, client);
  assert.equal((await (await call('companies', 200, admin)).json()).length, 2);
  assert.deepEqual(
    (await (await call('branches', 200, client)).json()).map((b) => b.id),
    [1, 2],
  );
  await call('branches/1', 200, client);
  await call('branches/3', 404, client);
  for (const path of ['dashboard', 'reviews', 'export']) {
    await call(path + '?' + range, 200, client);
    await call(path + '?' + range + '&branchId=3', 404, client);
  }
};
const verifyImport = async (client, admin) => {
  const payload = { branchId: 4, from: '2020-01-01', to: '2020-01-03' };
  await call('imports', 403, client, payload);
  const count = () =>
    execFileSync(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'db',
        'psql',
        '-U',
        'postgres',
        '-d',
        'geo',
        '-Atc',
        "select count(*) from daily_metrics where branch_id=4 and date between '2020-01-01' and '2020-01-03'",
      ],
      { encoding: 'utf8' },
    ).trim();
  const once = async () => {
    assert.equal((await (await call('imports', 201, admin, payload)).json()).rows, 3);
    assert.equal(count(), '3');
    return (await call('dashboard?' + range + '&branchId=4', 200, admin)).json();
  };
  assert.deepEqual(await once(), await once());
};
const run = async () => {
  const client = await login('client');
  const admin = await login('admin');
  await verifyReads(client, admin);
  const change = { status: 'resolved' };
  await call('reviews/0', 401, '', change, 'PATCH');
  await call('reviews/0', 404, client, change, 'PATCH');
  await verifyImport(client, admin);
  await call('logout', 201, client, {});
  process.stdout.write('smoke OK\n');
};
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
