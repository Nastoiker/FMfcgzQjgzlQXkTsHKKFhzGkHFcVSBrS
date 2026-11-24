import { InvalidPeriod } from '@/common/errors';
import type { Period } from '@/common/filters.dto';

export const validatePeriod = (period: Period): void => {
  if (period.from > period.to || Date.parse(period.to) - Date.parse(period.from) > 365 * 86400000)
    throw new InvalidPeriod();
};
