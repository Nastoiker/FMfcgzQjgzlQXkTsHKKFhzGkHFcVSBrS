import type { TBranch } from '@/entities/branch/model/catalog';

export const branchLabel = (b: TBranch): string => b.company + ' · ' + b.name;

export const branchChoices = (branches: TBranch[]): Record<string, string> =>
  Object.fromEntries(branches.map((b) => [String(b.id), branchLabel(b)]));
