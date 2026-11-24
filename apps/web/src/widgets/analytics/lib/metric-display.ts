import type { TMetric } from '@/entities/report';
const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const signed = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
export const displayValue = (value: number | null): string =>
  value === null ? '—' : formatter.format(value);
export const deltaFor = (
  value: number | null,
  previous: number | null,
): { value: string; tone: string } => {
  if (value === null || previous === null) return { value: '', tone: 'neutral' };
  const delta = value - previous;
  if (delta > 0) return { value: signed.format(delta), tone: 'up' };
  if (delta < 0) return { value: signed.format(delta), tone: 'down' };
  return { value: '0', tone: 'neutral' };
};
export const tones: Record<TMetric, string> = {
  views: 'violet',
  site: 'blue',
  calls: 'green',
  routes: 'orange',
  rating: 'gold',
  reviews: 'pink',
};
