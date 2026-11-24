import { createTheme } from '@mui/material/styles';

import { designTokens } from '@/app/design-tokens';

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: '[data-theme="%s"]' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#6765F2', dark: '#413FC0', contrastText: '#fff' },
        secondary: { main: '#656565' },
        success: { main: '#0AAF60', dark: '#087140' },
        warning: { main: '#F2A646', dark: '#84520F' },
        error: { main: '#F44336', dark: '#AC322B' },
        text: { primary: '#3F3F3F', secondary: '#656565', disabled: '#D1D1D1' },
        background: { default: '#F7F7FB', paper: '#FFFFFF' },
        divider: '#E8E8EF',
        action: { selected: '#F3F3FD', hover: '#F3F3FD', disabled: '#D1D1D1' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#ABA7FF', dark: '#BCB9FF', contrastText: '#211E41' },
        secondary: { main: '#C0BDD0' },
        success: { main: '#78DAB1', dark: '#84DFB7' },
        warning: { main: '#F6BE80', dark: '#FFC37C' },
        error: { main: '#FF99A7', dark: '#FFACB8' },
        text: { primary: '#F2F1FA', secondary: '#BFBDCF', disabled: '#878498' },
        background: { default: '#171720', paper: '#22222F' },
        divider: '#3B3A4C',
        action: { selected: '#302E49', hover: '#302E49' },
      },
    },
  },
  spacing: 4,
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: 14,
    body1: { fontSize: 14, fontWeight: 400 },
    caption: { fontSize: 12 },
    button: { textTransform: 'none', fontWeight: 600 },
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: { styleOverrides: { ':root': designTokens } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 36 },
        containedPrimary: { '&:hover': { backgroundColor: 'var(--line)' } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 90,
          '&.MuiChip-outlinedSuccess': { color: 'var(--good)' },
          '&.MuiChip-outlinedWarning': { color: 'var(--warm)' },
          '&.MuiChip-outlinedPrimary': { color: 'var(--line)' },
        },
      },
    },
  },
});
