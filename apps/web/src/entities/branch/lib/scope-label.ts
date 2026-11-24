import type { TBranch } from '@/entities/branch/model/catalog';
export const scopeLabel = (branches: TBranch[], branchId: string): string => {
  const selected = branches.find((branch) => String(branch.id) === branchId);
  if (selected) return selected.company + ' · ' + selected.name;
  const companies = new Set(branches.map((branch) => branch.company));
  const name = companies.size === 1 ? branches[0]?.company : 'Все компании';
  return name ? name + ' · Филиалов: ' + String(branches.length) : '';
};

export const visibleBranches = (branches: TBranch[], company: string): TBranch[] =>
  branches.filter((branch) => !company || String(branch.company_id) === company);
