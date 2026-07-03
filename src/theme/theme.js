import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    }
  },
  palette: {
    mode,
    background: { default: mode === 'dark' ? '#121212' : '#f5f5f5' },
    primary: { main: mode === 'dark' ? '#81c784' : '#2e7d32' },
    secondary: { main: mode === 'dark' ? '#90caf9' : '#1565c0' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  }
});
