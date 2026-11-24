import { setTimeout } from 'node:timers/promises';

import { z } from 'zod';

import { config } from '@/common/config';
import type { IMetric } from '@/common/metrics.interface';
import type { ImportPeriod } from '@/modules/imports/dto/imports.dto';

const count = z.number().int().nonnegative().max(2147483647);

const row = z.object({
  branch_id: count,
  date: z.iso.date(),
  views: count,
  site: count,
  calls: count,
  routes: count,
});

export class SourceFailure extends Error {
  constructor(
    message: string,
    readonly temporary = false,
  ) {
    super(message);
  }
}

const parseRows = (payload: unknown, period: ImportPeriod): IMetric[] => {
  const result = z.array(row).safeParse(payload);
  if (!result.success) throw new SourceFailure('Неверный формат данных');
  if (
    result.data.some(
      (r) => r.branch_id !== period.branchId || r.date < period.from || r.date > period.to,
    )
  )
    throw new SourceFailure('Источник вернул другой филиал или период');
  return [...new Map(result.data.map((r) => [r.date, r])).values()];
};

const readSource = async (url: URL, period: ImportPeriod): Promise<IMetric[]> => {
  const signal = AbortSignal.timeout(600);
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      await response.body?.cancel();
      throw new SourceFailure(
        `HTTP ${String(response.status)}`,
        response.status === 429 || response.status >= 500,
      );
    }
    const payload: unknown = await response.json();
    return parseRows(payload, period);
  } catch (error) {
    if (error instanceof SourceFailure) throw error;
    if (signal.aborted) throw new SourceFailure('Истёк таймаут источника', true);
    throw new SourceFailure('Не удалось прочитать ответ источника');
  }
};

export const download = async (period: ImportPeriod, onAttempt: () => void): Promise<IMetric[]> => {
  const url = new URL(config.PROVIDER_URL);
  url.search = new URLSearchParams({
    branchId: String(period.branchId),
    from: period.from,
    to: period.to,
  }).toString();
  for (let attempt = 1; ; attempt++) {
    onAttempt();
    try {
      return await readSource(url, period);
    } catch (error) {
      if (!(error instanceof SourceFailure) || !error.temporary || attempt === 4) throw error;
      await setTimeout(100 * 2 ** (attempt - 1) + Math.random() * 50);
    }
  }
};
