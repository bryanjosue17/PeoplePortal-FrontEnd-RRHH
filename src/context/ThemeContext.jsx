import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getTheme } from '../theme/theme';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'system';
  });

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleThemeMode = (mode) => {
    setThemeMode(mode);
  };

  const actualMode = themeMode === 'system' 
    ? (prefersDarkMode ? 'dark' : 'light') 
    : themeMode;

  const theme = useMemo(() => getTheme(actualMode), [actualMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleThemeMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
