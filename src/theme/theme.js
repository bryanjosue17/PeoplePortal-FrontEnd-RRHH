import { createTheme } from '@mui/material/styles';

const dark = {
  primary:   { main: '#34D399', light: '#6EE7B7', dark: '#10B981', contrastText: '#022C22' },
  secondary: { main: '#60A5FA', light: '#93C5FD', dark: '#3B82F6', contrastText: '#0D1B2A' },
  background: { default: '#0F172A', paper: '#1E293B' },
  divider: 'rgba(148,163,184,0.12)',
  text: { primary: '#E2E8F0', secondary: '#94A3B8', disabled: '#475569' },
  action: {
    hover: 'rgba(52,211,153,0.08)',
    selected: 'rgba(52,211,153,0.16)',
    disabledBackground: 'rgba(255,255,255,0.05)',
  },
};

const light = {
  primary:   { main: '#2E7D32', light: '#388E3C', dark: '#1B5E20', contrastText: '#FFFFFF' },
  secondary: { main: '#1565C0', light: '#1976D2', dark: '#0D47A1', contrastText: '#FFFFFF' },
  background: { default: '#F0F7F0', paper: '#FFFFFF' },
  text: { primary: '#1E293B', secondary: '#64748B' },
};

export const getTheme = (mode) => createTheme({
  palette: { mode, ...(mode === 'dark' ? dark : light) },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? '#334155' : '#CBD5E1',
            borderRadius: 3,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
          backgroundImage: 'none',
          boxShadow: mode === 'dark'
            ? '0 1px 0 rgba(148,163,184,0.1)'
            : '0 1px 0 rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#0F172A' : '#FFFFFF',
          backgroundImage: 'none',
          borderRight: mode === 'dark'
            ? '1px solid rgba(148,163,184,0.1)'
            : '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: 'none',
          ...(mode === 'dark' && {
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }),
          ...(mode === 'light' && {
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
          }),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(mode === 'dark' && {
            border: '1px solid rgba(148,163,184,0.08)',
          }),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        containedPrimary: mode === 'dark' ? {
          background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
          color: '#022C22',
          '&:hover': { background: 'linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)' },
        } : {},
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 2,
          marginLeft: 8,
          marginRight: 8,
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? 'rgba(52,211,153,0.15)' : '#2E7D32',
            color: mode === 'dark' ? '#34D399' : '#FFFFFF',
            '& .MuiListItemIcon-root': { color: mode === 'dark' ? '#34D399' : '#FFFFFF' },
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(52,211,153,0.22)' : '#1B5E20',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'dark'
              ? 'rgba(52,211,153,0.06)'
              : 'rgba(46,125,50,0.06)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark'
            ? '1px solid rgba(148,163,184,0.08)'
            : '1px solid rgba(0,0,0,0.06)',
        },
        head: {
          fontWeight: 700,
          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundImage: 'none',
          ...(mode === 'dark' && {
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.15)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          }),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === 'dark'
            ? 'rgba(148,163,184,0.1)'
            : 'rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { borderRadius: '3px 3px 0 0', height: 3 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          minHeight: 48,
          textTransform: 'none',
          '&.Mui-selected': { fontWeight: 700 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
        standardInfo: mode === 'dark' ? {
          backgroundColor: 'rgba(52,211,153,0.1)',
          color: '#6EE7B7',
        } : {},
        standardSuccess: mode === 'dark' ? {
          backgroundColor: 'rgba(52,211,153,0.1)',
        } : {},
        standardError: mode === 'dark' ? {
          backgroundColor: 'rgba(248,113,113,0.1)',
        } : {},
        standardWarning: mode === 'dark' ? {
          backgroundColor: 'rgba(251,191,36,0.1)',
        } : {},
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 6, fontSize: '0.75rem' },
      },
    },
  },
});
