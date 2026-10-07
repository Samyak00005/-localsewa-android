import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  AppIcon,
  AppIconName,
  iconSize,
} from '../components/icons';
import {
  ProviderHeader,
} from '../components/provider';
import {
  ProviderHomeScreen,
  ProviderProfileScreen,
  ProviderRequestsScreen,
  ProviderReviewsScreen,
  ProviderServicesScreen,
} from '../screens/provider';
import {
  radius,
  useAppTheme,
} from '../theme';
import {
  ProviderTabParamList,
} from './types';

const Tab =
  createBottomTabNavigator<ProviderTabParamList>();

const labels: Record<
  keyof ProviderTabParamList,
  string
> = {
  ProviderHome: 'Home',
  ProviderRequests: 'Requests',
  ProviderServices: 'Services',
  ProviderReviews: 'Reviews',
  ProviderProfile: 'Profile',
};

const icons: Record<
  keyof ProviderTabParamList,
  AppIconName
> = {
  ProviderHome: 'home',
  ProviderRequests: 'calendar',
  ProviderServices: 'wrench',
  ProviderReviews: 'star',
  ProviderProfile: 'user',
};

export function ProviderTabs(): React.JSX.Element {
  const {
    theme,
    mode,
  } = useAppTheme();

  const insets =
    useSafeAreaInsets();

  const bottomInset =
    Math.max(
      insets.bottom,
      8,
    );

  const premium =
    mode ===
    'providerPremium';

  const activeColor =
    premium
      ? theme.colors
          .premiumGoldStrong ??
        theme.colors.accent
      : theme.colors.primary;

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }) => ({
        headerShown: true,
        header: () => (
          <ProviderHeader />
        ),
        tabBarHideOnKeyboard:
          true,
        tabBarActiveTintColor:
          activeColor,
        tabBarInactiveTintColor:
          premium
            ? '#776E7E'
            : theme.colors
                .textMuted,
        tabBarStyle: {
          backgroundColor:
            premium
              ? theme.colors
                  .premiumIvorySurface ??
                theme.colors
                  .surface
              : theme.colors
                  .surface,
          borderTopColor:
            premium
              ? theme.colors
                  .premiumGoldSoft ??
                theme.colors
                  .border
              : theme.colors
                  .border,
          height:
            58 +
            bottomInset,
          paddingTop: 6,
          paddingBottom:
            bottomInset,
        },
        tabBarItemStyle: {
          paddingTop: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarLabel:
          labels[
            route.name
          ],
        tabBarIcon: ({
          focused,
          color,
        }) => (
          <ProviderTabIcon
            name={
              icons[
                route.name
              ]
            }
            color={color}
            focused={
              focused
            }
            premium={
              premium
            }
          />
        ),
      })}>
      <Tab.Screen
        name="ProviderHome"
        component={
          ProviderHomeScreen
        }
      />

      <Tab.Screen
        name="ProviderRequests"
        component={
          ProviderRequestsScreen
        }
      />

      <Tab.Screen
        name="ProviderServices"
        component={
          ProviderServicesScreen
        }
      />

      <Tab.Screen
        name="ProviderReviews"
        component={
          ProviderReviewsScreen
        }
      />

      <Tab.Screen
        name="ProviderProfile"
        component={
          ProviderProfileScreen
        }
      />
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
  const {
    theme,
  } = useAppTheme();

  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor:
            focused
              ? premium
                ? theme.colors
                    .premiumGoldSoft ??
                  '#F7E8BE'
                : theme.colors
                    .secondary
              : 'transparent',
        },
      ]}>
      <AppIcon
        name={name}
        size={
          iconSize.sm
        }
        color={color}
        strokeWidth={
          focused
            ? 2.4
            : 2
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    iconWrap: {
      width: 36,
      height: 30,
      borderRadius:
        radius.md,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
  });
