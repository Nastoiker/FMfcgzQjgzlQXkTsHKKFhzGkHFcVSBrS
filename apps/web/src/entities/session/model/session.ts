import { z } from 'zod';

export const user = z.object({
  login: z.string(),
  role: z.enum(['admin', 'client']),
  company_id: z.number().int().positive().nullable(),
});

export type TViewer = z.infer<typeof user>;
