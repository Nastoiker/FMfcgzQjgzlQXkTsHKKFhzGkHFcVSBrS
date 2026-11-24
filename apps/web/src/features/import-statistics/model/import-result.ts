import { z } from 'zod';

import { count } from '@/shared/api/count';

export const imported = z.object({ rows: count });
