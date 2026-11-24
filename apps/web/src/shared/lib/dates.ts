import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
export const dayAgo = (offset: number): string =>
  dayjs.utc().subtract(offset, 'day').format('YYYY-MM-DD');
export const formatDate = (date: string): string => dayjs.utc(date).format('DD.MM.YYYY');
export const daysBetween = (from: string, to: string): number =>
  dayjs.utc(to).diff(dayjs.utc(from), 'day');
