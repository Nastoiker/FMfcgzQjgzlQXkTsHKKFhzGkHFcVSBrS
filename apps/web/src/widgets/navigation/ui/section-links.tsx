import ApartmentRounded from '@mui/icons-material/ApartmentRounded';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import SpaceDashboardOutlined from '@mui/icons-material/SpaceDashboardOutlined';
import ListItemButton from '@mui/material/ListItemButton';
import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
const sections = [
  { key: '', label: 'Дашборд', Icon: SpaceDashboardOutlined },
  { key: 'branches', label: 'Филиалы', Icon: ApartmentRounded },
  { key: 'reviews', label: 'Отзывы', Icon: ForumOutlined },
];
const searchFor = (search: string, key: string): string => {
  const params = new URLSearchParams(search);
  if (key) params.set('view', key);
  else params.delete('view');
  if (key === 'branches') {
    params.delete('branchId');
    params.delete('compareId');
  }
  return params.toString();
};
export const Sections = ({ onSelect }: { onSelect?: () => void }): ReactElement => {
  const { search } = useLocation();
  const active = new URLSearchParams(search).get('view') ?? '';
  return (
    <nav className="sections" aria-label="Разделы кабинета">
      {sections.map(({ key, label, Icon }) => (
        <ListItemButton
          key={key}
          component={Link}
          onClick={onSelect}
          to={{ search: searchFor(search, key) }}
          selected={active === key}
          aria-current={active === key ? 'page' : undefined}
        >
          <Icon fontSize="small" />
          {label}
        </ListItemButton>
      ))}
    </nav>
  );
};
