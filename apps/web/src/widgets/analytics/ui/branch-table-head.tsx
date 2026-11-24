import type { ReactElement } from 'react';

import type { IBranchSort, TBranchColumn } from '@/widgets/analytics/model/branch-sort.interface';
const columns: { key: TBranchColumn; label: string }[] = [
  { key: 'name', label: 'Филиал' },
  { key: 'views', label: 'Просмотры' },
  { key: 'calls', label: 'Звонки' },
  { key: 'rating', label: 'Рейтинг' },
  { key: 'reviews', label: 'Отзывы' },
];
export const BranchTableHead = ({
  sort,
  onSort,
}: {
  sort: IBranchSort;
  onSort: (column: TBranchColumn) => void;
}): ReactElement => (
  <thead>
    <tr>
      {columns.map(({ key, label }) => (
        <th key={key} scope="col" aria-sort={key === sort.column ? sort.direction : undefined}>
          <button
            className="table-sort"
            onClick={() => {
              onSort(key);
            }}
            title={'Сортировать по столбцу «' + label + '»'}
          >
            {label}
          </button>
        </th>
      ))}
    </tr>
  </thead>
);
