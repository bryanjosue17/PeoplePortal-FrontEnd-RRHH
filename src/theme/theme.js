import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    }
  },
  palette: {
    background: { default: '#f5f5f5' },
    primary: { main: '#2e7d32' },
    secondary: { main: '#1565c0' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  }
});

export default theme;
