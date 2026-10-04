import React from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {useAppShell} from '../app/AppShellProvider';
import {useAuth} from '../auth';
import {
  SessionBootstrapScreen,
  SessionRecoveryScreen,
} from '../screens/shared';
import {useAppTheme} from '../theme';
import {AuthNavigator} from './AuthNavigator';
import {CustomerTabs} from './CustomerTabs';
import {ProviderTabs} from './ProviderTabs';
import {linking} from './linking';
import {RootStackParamList} from './types';

const RootStack =
  createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const {area} = useAppShell();
  const {
    token,
    user,
    restoring,
    sessionError,
  } = useAuth();
  const {theme} = useAppTheme();

  if (restoring) {
    return <SessionBootstrapScreen />;
  }

  if (
    sessionError &&
    token &&
    !user
  ) {
    return (
      <SessionRecoveryScreen
        message={sessionError}
      />
    );
  }

  const navigationTheme: NavigationTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      theme={navigationTheme}>
      <RootStack.Navigator
        key={area}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        {area === 'provider' ? (
          <RootStack.Screen
            name="Provider"
            component={ProviderTabs}
          />
        ) : area === 'customer' ? (
          <RootStack.Screen
            name="Customer"
            component={CustomerTabs}
          />
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
