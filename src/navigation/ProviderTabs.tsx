import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {AppIcon, AppIconName, iconSize} from '../components/icons';
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

const icons: Record<keyof ProviderTabParamList, AppIconName> = {
  ProviderHome: 'home',
  ProviderRequests: 'calendar',
  ProviderServices: 'wrench',
  ProviderReviews: 'star',
  ProviderProfile: 'user',
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
        tabBarInactiveTintColor: premium ? '#D9D1DF' : theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: premium ? theme.colors.secondary : theme.colors.surface,
          borderTopColor: premium ? theme.colors.accent : theme.colors.border,
          height: 72,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({focused, color}) => (
          <ProviderTabIcon
            name={icons[route.name]}
            color={color}
            focused={focused}
            premium={premium}
          />
        ),
      })}>
      <Tab.Screen name="ProviderHome" component={ProviderHomeScreen} />
      <Tab.Screen name="ProviderRequests" component={ProviderRequestsScreen} />
      <Tab.Screen name="ProviderServices" component={ProviderServicesScreen} />
      <Tab.Screen name="ProviderReviews" component={ProviderReviewsScreen} />
      <Tab.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    </Tab.Navigator>
  );
}

function ProviderTabIcon({
  name,
  color,
  focused,
  premium,
}: {
  name: AppIconName;
  color: string;
  focused: boolean;
  premium: boolean;
}): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: focused
            ? premium
              ? theme.colors.premiumGoldSoft
              : theme.colors.secondary
            : 'transparent',
        },
      ]}>
      <AppIcon
        name={name}
        size={iconSize.sm}
        color={color}
        strokeWidth={focused ? 2.4 : 2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
