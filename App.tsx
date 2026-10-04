import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppShellProvider} from './src/app/AppShellProvider';
import {AuthProvider} from './src/auth';
import {RootNavigator} from './src/navigation/RootNavigator';
import {ThemeProvider, useAppTheme} from './src/theme';

function AppContent(): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <RootNavigator />
    </>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShellProvider>
            <AppContent />
          </AppShellProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
