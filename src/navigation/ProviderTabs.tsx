import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {AppText} from '../components/ui';
import {
  ProviderHomeScreen,
  ProviderProfileScreen,
  ProviderRequestsScreen,
  ProviderReviewsScreen,
  ProviderServicesScreen,
} from '../screens/provider';
import {radius, useAppTheme} from '../theme';
import {ProviderTabParamList} from './types';

const Tab = createBottomTabNavigator<ProviderTabParamList>();

const labels: Record<keyof ProviderTabParamList, string> = {
  ProviderHome: 'Home',
  ProviderRequests: 'Requests',
  ProviderServices: 'Services',
  ProviderReviews: 'Reviews',
  ProviderProfile: 'Profile',
};

const glyphs: Record<keyof ProviderTabParamList, string> = {
  ProviderHome: 'H',
  ProviderRequests: 'R',
  ProviderServices: 'S',
  ProviderReviews: '★',
  ProviderProfile: 'P',
};

export function ProviderTabs(): React.JSX.Element {
  const {theme, mode} = useAppTheme();
  const premium = mode === 'providerPremium';

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: premium
          ? theme.colors.accent
          : theme.colors.primary,
        tabBarInactiveTintColor: premium
          ? '#D9D1DF'
          : theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: premium
            ? theme.colors.secondary
            : theme.colors.surface,
          borderTopColor: premium
            ? theme.colors.accent
            : theme.colors.border,
          height: 66,
          paddingTop: 6,
          paddingBottom: 7,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({focused}) => (
          <ProviderTabGlyph
            value={glyphs[route.name]}
            focused={focused}
            premium={premium}
          />
        ),
      })}>
      <Tab.Screen
        name="ProviderHome"
        component={ProviderHomeScreen}
      />
      <Tab.Screen
        name="ProviderRequests"
        component={ProviderRequestsScreen}
      />
      <Tab.Screen
        name="ProviderServices"
        component={ProviderServicesScreen}
      />
      <Tab.Screen
        name="ProviderReviews"
        component={ProviderReviewsScreen}
      />
      <Tab.Screen
        name="ProviderProfile"
        component={ProviderProfileScreen}
      />
    </Tab.Navigator>
  );
}

function ProviderTabGlyph({
  value,
  focused,
  premium,
}: {
  value: string;
  focused: boolean;
  premium: boolean;
}): React.JSX.Element {
  const {theme} = useAppTheme();

  const active = premium
    ? theme.colors.accent
    : theme.colors.primary;

  return (
    <View
      style={[
        styles.glyph,
        {
          backgroundColor: focused
            ? premium
              ? theme.colors.premiumGoldSoft
              : theme.colors.secondary
            : 'transparent',
        },
      ]}>
      <AppText
        variant="caption"
        color={
          focused
            ? active
            : premium
              ? '#D9D1DF'
              : theme.colors.textMuted
        }
        style={styles.glyphText}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontWeight: '700',
  },
});
