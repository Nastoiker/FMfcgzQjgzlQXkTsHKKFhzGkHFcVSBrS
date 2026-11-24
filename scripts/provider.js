import { pathToFileURL } from 'node:url';
import http from 'node:http';

let serial = 0;
const respond = (req, res) => {
  const q = new URL(req.url, 'http://localhost').searchParams;
  const begin = Date.parse(q.get('from')),
    end = Date.parse(q.get('to')),
    branch = Number(q.get('branchId'));
  if (
    !Number.isFinite(begin + end) ||
    end < begin ||
    end - begin > 365 * 86400000 ||
    !Number.isInteger(branch) ||
    branch < 1
  ) {
    res.writeHead(400).end();
    return;
  }
  const chance = ++serial % 4 === 0 ? 0.5 : Math.random();
  if (chance < 0.06) {
    res.writeHead(chance < 0.03 ? 500 : 429).end();
    return;
  }
  const rows = [];
  for (let time = begin; time <= end; time += 86400000) {
    const day = Math.floor(time / 86400000);
    rows.push({
      branch_id: branch,
      date: new Date(time).toISOString().slice(0, 10),
      views: 100 + (day % 30) + branch,
      site: 10 + (day % 7),
      calls: 3 + (day % 4),
      routes: 8 + (day % 5),
    });
  }
  setTimeout(
    () => res.end(JSON.stringify(chance < 0.5 ? [...rows, rows[0]] : rows)),
    chance > 0.97 ? 900 : 0,
  );
};
export default respond;
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  http.createServer(respond).listen(3100);
