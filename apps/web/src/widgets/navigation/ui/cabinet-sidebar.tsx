import LogoutRounded from '@mui/icons-material/LogoutRounded';
import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

import type { TViewer } from '@/entities/session';
import { ThemePicker } from '@/features/color-mode';
import { useLogout } from '@/features/sign-out';
import { Brand } from '@/shared/ui/brand';
import { ReportState } from '@/shared/ui/report-state';
import { NavigationFrame } from '@/widgets/navigation/ui/navigation-frame';
import { Sections } from '@/widgets/navigation/ui/section-links';

const AccountIdentity = ({ viewer }: { viewer: TViewer }): ReactElement => {
  const role = viewer.role === 'admin' ? 'Администратор' : 'Клиент';
  return (
    <div className="identity">
      <span className="identity__avatar" aria-hidden="true">
        {role[0]}
      </span>
      <div>
        <b>{role}</b>
        <small>{viewer.login}</small>
      </div>
    </div>
  );
};
const Account = ({ viewer }: { viewer: TViewer }): ReactElement => {
  const logout = useLogout();
  const leave = () => {
    logout.mutate();
  };
  return (
    <div className="sidebar__account">
      <ThemePicker />
      <AccountIdentity viewer={viewer} />
      <Button
        className="sidebar__logout"
        color="inherit"
        startIcon={<LogoutRounded />}
        disabled={logout.isPending}
        onClick={leave}
      >
        {logout.isPending ? 'Выходим…' : 'Выйти'}
      </Button>
      {logout.isError && <ReportState state="error" message={logout.error.message} retry={leave} />}
    </div>
  );
};
export const CabinetSidebar = ({ viewer }: { viewer: TViewer }): ReactElement => (
  <>
    <a className="skip-link" href="#cabinet-main">
      К содержанию
    </a>
    <NavigationFrame>
      {(closeMenu) => (
        <>
          <header className="sidebar__brand">
            <Brand />
          </header>
          <Sections onSelect={closeMenu} />
          <Account viewer={viewer} />
        </>
      )}
    </NavigationFrame>
  </>
);
