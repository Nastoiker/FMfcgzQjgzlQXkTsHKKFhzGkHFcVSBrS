import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const input = process.argv[2];
if (!input) throw new Error('Укажите каталог сборки LikeC4.');
let html = await readFile(path.join(input, 'index.html'), 'utf8');
const favicon = html.match(/href="(?:\.\/)?(favicon-[\w-]+\.svg)"/u);
if (favicon) {
  const icon = await readFile(path.join(input, favicon[1]));
  html = html.replace(favicon[0], `href="data:image/svg+xml;base64,${icon.toString('base64')}"`);
} else if (!html.includes('href="data:image/svg+xml')) {
  throw new Error('В сборке отсутствует значок LikeC4.');
}

// LikeC4 сохраняет рядом с относительной ссылкой URI машины, на которой собрана карта.
const localSource = /(url:`\.\.\/[^`]+`,title:`Открыть исходник`),relative:`file:\/\/[^`]+`/gu;
const portable = html.replace(localSource, '$1');
if (portable === html || portable.includes('relative:`file:')) {
  throw new Error('Проверьте формат ссылок LikeC4 перед упаковкой карты.');
}
const result = portable
  .replace('<html lang="en-US">', '<html lang="ru">')
  .replace('<title>LikeC4</title>', '<title>Истинный интеллект · Архитектура</title>');

const directory = new URL('./map/', import.meta.url);
await mkdir(directory, { recursive: true });
const map = new URL('index.html', directory);
await writeFile(map, result);

async function renderPreview(browser, view, filename) {
  const page = await browser.newPage({ offline: true, locale: 'ru-RU' });
  await page.goto(map.href + '#/export/' + view + '/?padding=30&theme=light');
  await page.locator('.react-flow.initialized').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const diagram = page.getByTestId('export-page');
  const box = await diagram.boundingBox();
  if (!box) throw new Error('Не удалось отрисовать схему ' + view);
  await page.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
  await diagram.screenshot({
    path: fileURLToPath(new URL(filename, import.meta.url)),
    animations: 'disabled',
  });
  await page.close();
}

const browser = await chromium.launch();
try {
  await renderPreview(browser, 'containers', 'containers.png');
  await renderPreview(browser, 'backend', 'backend.png');
  await renderPreview(browser, 'metricsCode', 'metrics.png');
} finally {
  await browser.close();
}
process.stdout.write(
  'docs/architecture/map/index.html + containers.png, backend.png, metrics.png\n',
);
