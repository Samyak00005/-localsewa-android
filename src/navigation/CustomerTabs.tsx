import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, AppIconName, iconSize } from '../components/icons';
import { CustomerHeader } from '../components/navigation';
import {
  CustomerBookingsScreen,
  CustomerHomeScreen,
  CustomerProfileScreen,
  CustomerSavedScreen,
  CustomerServicesScreen,
} from '../screens/customer';
import { radius, useAppTheme } from '../theme';
import { CustomerTabParamList } from './types';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const labels: Record<keyof CustomerTabParamList, string> = {
  CustomerHome: 'Home',
  CustomerServices: 'All services',
  CustomerBookings: 'Bookings',
  CustomerSaved: 'Saved',
  CustomerProfile: 'Profile',
};

const icons: Record<keyof CustomerTabParamList, AppIconName> = {
  CustomerHome: 'home',
  CustomerServices: 'servicesGrid',
  CustomerBookings: 'calendar',
  CustomerSaved: 'bookmark',
  CustomerProfile: 'user',
};

export function CustomerTabs(): React.JSX.Element {
  const { theme } = useAppTheme();

  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => <CustomerHeader routeName={route.name} />,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 58 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarItemStyle: {
          paddingTop: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={icons[route.name]} color={color} focused={focused} />
        ),
      })}
    >
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
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: focused ? theme.colors.secondary : 'transparent',
        },
      ]}
    >
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
