import CloseRounded from '@mui/icons-material/CloseRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { ThemePicker } from '@/features/color-mode';
import { Brand } from '@/shared/ui/brand';
type TNavigationContent = (closeMenu?: () => void) => ReactElement;
const MobileBar = ({
  isOpen,
  openMenu,
}: {
  isOpen: boolean;
  openMenu: () => void;
}): ReactElement => (
  <header className="mobile-bar">
    <IconButton
      aria-label="Открыть меню"
      aria-expanded={isOpen}
      aria-controls={isOpen ? 'cabinet-menu' : undefined}
      onClick={openMenu}
    >
      <MenuRounded />
    </IconButton>
    <Brand />
    <ThemePicker />
  </header>
);
const MobileNavigation = ({ children }: { children: TNavigationContent }): ReactElement => {
  const [isOpen, setOpen] = useState(false);
  const closeMenu = () => {
    setOpen(false);
  };
  return (
    <>
      <MobileBar
        isOpen={isOpen}
        openMenu={() => {
          setOpen(true);
        }}
      />
      <Drawer
        open={isOpen}
        onClose={closeMenu}
        slotProps={{
          paper: {
            id: 'cabinet-menu',
            className: 'menu-drawer',
            role: 'dialog',
            'aria-modal': true,
            'aria-label': 'Меню кабинета',
          },
        }}
      >
        <div className="sidebar sidebar--drawer">
          <IconButton className="menu-close" aria-label="Закрыть меню" onClick={closeMenu}>
            <CloseRounded />
          </IconButton>
          {children(closeMenu)}
        </div>
      </Drawer>
    </>
  );
};
export const NavigationFrame = ({ children }: { children: TNavigationContent }): ReactElement => {
  const isDesktop = useMediaQuery('(min-width:900px)');
  if (isDesktop)
    return (
      <aside className="sidebar" aria-label="Навигация кабинета">
        {children()}
      </aside>
    );
  return <MobileNavigation>{children}</MobileNavigation>;
};
