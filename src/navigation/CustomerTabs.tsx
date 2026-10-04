import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {AppIcon, AppIconName, iconSize} from '../components/icons';
import {
  CustomerBookingsScreen,
  CustomerHomeScreen,
  CustomerProfileScreen,
  CustomerSavedScreen,
  CustomerServicesScreen,
} from '../screens/customer';
import {radius, useAppTheme} from '../theme';
import {CustomerTabParamList} from './types';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const labels: Record<keyof CustomerTabParamList, string> = {
  CustomerHome: 'Home',
  CustomerServices: 'Services',
  CustomerBookings: 'Bookings',
  CustomerSaved: 'Saved',
  CustomerProfile: 'Profile',
};

const icons: Record<keyof CustomerTabParamList, AppIconName> = {
  CustomerHome: 'home',
  CustomerServices: 'wrench',
  CustomerBookings: 'calendar',
  CustomerSaved: 'bookmark',
  CustomerProfile: 'user',
};

export function CustomerTabs(): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
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
          <TabIcon name={icons[route.name]} color={color} focused={focused} />
        ),
      })}>
      <Tab.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <Tab.Screen name="CustomerServices" component={CustomerServicesScreen} />
      <Tab.Screen name="CustomerBookings" component={CustomerBookingsScreen} />
      <Tab.Screen name="CustomerSaved" component={CustomerSavedScreen} />
      <Tab.Screen name="CustomerProfile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: AppIconName;
  color: string;
  focused: boolean;
}): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: focused ? theme.colors.secondary : 'transparent',
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
