import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { theme } from './index';

type ThemeContextType = typeof theme;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  value?: ThemeContextType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  value = theme,
}) => {
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
