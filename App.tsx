import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {AppShellProvider} from './src/app/AppShellProvider';
import {AuthProvider} from './src/auth';
import {RootNavigator} from './src/navigation/RootNavigator';
import {ThemeProvider, useAppTheme} from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnReconnect: true,
    },
  },
});

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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppShellProvider>
              <AppContent />
            </AppShellProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
