import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

import { AppTheme, AppThemeMode, customerTheme, themes } from './themes';

type ThemeContextValue = {
  mode: AppThemeMode;
  theme: AppTheme;
  setMode: (mode: AppThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'customer',
  theme: customerTheme,
  setMode: () => undefined,
});

type ThemeProviderProps = PropsWithChildren<{
  initialMode?: AppThemeMode;
}>;

export function ThemeProvider({
  children,
  initialMode = 'customer',
}: ThemeProviderProps): React.JSX.Element {
  const [mode, setMode] = useState<AppThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      theme: themes[mode],
      setMode,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
