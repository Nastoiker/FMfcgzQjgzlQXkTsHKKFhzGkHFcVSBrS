import { z } from 'zod';

import type { IReportFilters } from '@/features/report-filters/model/filters.interface';
import { daysBetween } from '@/shared/lib/dates';

const maxDayOffset = 365;

export const validRange = ({ from, to }: IReportFilters): boolean =>
  z.iso.date().safeParse(from).success &&
  z.iso.date().safeParse(to).success &&
  from <= to &&
  daysBetween(from, to) <= maxDayOffset;

export const queryFor = ({ from, to, company, branchId }: IReportFilters): string => {
  const params = new URLSearchParams({ from, to });
  if (company) params.set('company', company);
  if (branchId) params.set('branchId', branchId);
  return params.toString();
};
