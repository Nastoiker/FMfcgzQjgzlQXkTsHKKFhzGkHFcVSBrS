import type { IDay } from '@/common/metrics.interface';

/** TASK.md §2. Обе границы включены, сутки считаются в UTC. */
export const previousPeriod = (from: string, to: string): { from: string; to: string } => {
  const start = Date.parse(from),
    length = Date.parse(to) - start + 86400000;
  const iso = (v: number) => new Date(v).toISOString().slice(0, 10);
  return { from: iso(start - length), to: iso(start - 86400000) };
};

export const chartDays = <T extends IDay>(rows: T[]): T[] =>
  [...rows].sort((a, b) => a.date.localeCompare(b.date));
