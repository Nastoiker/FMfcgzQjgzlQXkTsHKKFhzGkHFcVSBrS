import '@/app/styles/site.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CabinetRoutes } from '@/app/cabinet-routes';
import { theme } from '@/app/theme';
import { syncSessionTabs } from '@/entities/session';
import { LoginPage } from '@/pages/login';

syncSessionTabs();
const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <ThemeProvider theme={theme} defaultMode="system" modeStorageKey="atlas-theme">
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={cache}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<CabinetRoutes />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
