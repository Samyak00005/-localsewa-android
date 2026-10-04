import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {AppText} from '../components/ui';
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

const glyphs: Record<keyof CustomerTabParamList, string> = {
  CustomerHome: 'H',
  CustomerServices: 'S',
  CustomerBookings: 'B',
  CustomerSaved: '★',
  CustomerProfile: 'P',
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
          <TabGlyph
            value={glyphs[route.name]}
            focused={focused}
          />
        ),
      })}>
      <Tab.Screen
        name="CustomerHome"
        component={CustomerHomeScreen}
      />
      <Tab.Screen
        name="CustomerServices"
        component={CustomerServicesScreen}
      />
      <Tab.Screen
        name="CustomerBookings"
        component={CustomerBookingsScreen}
      />
      <Tab.Screen
        name="CustomerSaved"
        component={CustomerSavedScreen}
      />
      <Tab.Screen
        name="CustomerProfile"
        component={CustomerProfileScreen}
      />
    </Tab.Navigator>
  );
}

function TabGlyph({
  value,
  focused,
}: {
  value: string;
  focused: boolean;
}): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <View
      style={[
        styles.glyph,
        {
          backgroundColor: focused
            ? theme.colors.secondary
            : 'transparent',
        },
      ]}>
      <AppText
        variant="caption"
        color={
          focused
            ? theme.colors.primary
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
