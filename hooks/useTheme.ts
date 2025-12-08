
import { useState, useEffect } from 'react';
import { ThemeId, ThemeConfig } from '../types';
import { THEMES, THEME_KEY } from '../constants';

export const useTheme = () => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('default');

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY) as ThemeId;
      if (storedTheme && THEMES[storedTheme]) {
        setCurrentThemeId(storedTheme);
      }
    } catch (e) {
      console.error("Failed to load theme preference", e);
    }
  }, []);

  const changeTheme = (id: ThemeId) => {
    setCurrentThemeId(id);
    localStorage.setItem(THEME_KEY, id);
  };

  const theme: ThemeConfig = THEMES[currentThemeId];

  return { currentThemeId, theme, changeTheme };
};
