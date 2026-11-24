import { z } from 'zod';

export const claims = z.discriminatedUnion('role', [
  z.object({ role: z.literal('admin'), login: z.string(), company_id: z.number().nullable() }),
  z.object({
    role: z.literal('client'),
    login: z.string(),
    company_id: z.number().int().positive(),
  }),
]);

export type TUser = z.infer<typeof claims>;
