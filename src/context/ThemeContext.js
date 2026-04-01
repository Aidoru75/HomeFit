import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '../storage/storage';
import { lightColors, darkColors } from '../theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadSettings().then(s => setIsDark(s.darkMode === true));
  }, []);

  const toggleDark = async (value) => {
    setIsDark(value);
    const s = await loadSettings();
    await saveSettings({ ...s, darkMode: value });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
