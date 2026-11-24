import { randomBytes } from 'node:crypto';

import { z } from 'zod';

const settings = z
  .object({
    DATABASE_URL: z.url().regex(/^postgres(ql)?:/),
    JWT_SECRET: z.string().min(32).optional(),
    COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
    PROVIDER_URL: z.url().default('http://provider:3100'),
  })
  .parse({ ...process.env, JWT_SECRET: process.env.JWT_SECRET || undefined });

export const config = {
  ...settings,
  secret: settings.JWT_SECRET ?? randomBytes(32).toString('hex'),
};
