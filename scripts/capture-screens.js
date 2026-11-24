import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
execFileSync(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve('@playwright/test/cli')),
    'test',
    'e2e/cabinet.spec.js',
    'e2e/reviews.spec.js',
    'e2e/comparison.spec.js',
    'e2e/theme.spec.js',
    'e2e/branch-table.spec.js',
  ],
  { env: { ...process.env, ATLAS_CAPTURE: '1' }, stdio: 'inherit' },
);
