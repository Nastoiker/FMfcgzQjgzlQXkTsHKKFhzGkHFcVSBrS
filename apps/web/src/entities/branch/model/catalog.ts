import { z } from 'zod';

export const companies = z.array(z.object({ id: z.number().int(), name: z.string() }));

export const branches = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
    company: z.string(),
    company_id: z.number().int(),
  }),
);

export type TCompany = z.infer<typeof companies>[number];

export type TBranch = z.infer<typeof branches>[number];
