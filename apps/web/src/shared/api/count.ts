import { z } from 'zod';

export const count = z.number().int().nonnegative();
