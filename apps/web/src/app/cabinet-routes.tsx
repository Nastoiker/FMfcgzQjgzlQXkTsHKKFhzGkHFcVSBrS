import type { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BranchesPage } from '@/pages/branches';
import { DashboardPage } from '@/pages/dashboard';
import { ReviewsPage } from '@/pages/reviews';
import { CabinetLayout } from '@/widgets/navigation';

const pages = new Map([
  ['branches', BranchesPage],
  ['reviews', ReviewsPage],
]);
export const CabinetRoutes = (): ReactElement => {
  const [search] = useSearchParams();
  const Page = pages.get(search.get('view') ?? '') ?? DashboardPage;
  return <CabinetLayout>{(viewer) => <Page viewer={viewer} />}</CabinetLayout>;
};
