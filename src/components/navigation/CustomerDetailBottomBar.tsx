import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomerTabParamList } from '../../navigation/types';
import { radius, useAppTheme } from '../../theme';
import { AppIcon, AppIconName, iconSize } from '../icons';
import { AppText } from '../ui';

type CustomerPrimaryRoute = keyof CustomerTabParamList;

type Props = {
  activeRoute: CustomerPrimaryRoute;
  onNavigate: (route: CustomerPrimaryRoute) => void;
};

const ITEMS: Array<{
  route: CustomerPrimaryRoute;
  label: string;
  icon: AppIconName;
}> = [
  {
    route: 'CustomerHome',
    label: 'Home',
    icon: 'home',
  },
  {
    route: 'CustomerServices',
    label: 'All services',
    icon: 'servicesGrid',
  },
  {
    route: 'CustomerBookings',
    label: 'Bookings',
    icon: 'calendar',
  },
  {
    route: 'CustomerSaved',
    label: 'Saved',
    icon: 'bookmark',
  },
  {
    route: 'CustomerProfile',
    label: 'Profile',
    icon: 'user',
  },
];

export function CustomerDetailBottomBar({
  activeRoute,
  onNavigate,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: bottomInset,
          height: 58 + bottomInset,
        },
      ]}
    >
      {ITEMS.map(item => {
        const selected = item.route === activeRoute;

        const color = selected ? theme.colors.primary : theme.colors.textMuted;

        return (
          <Pressable
            key={item.route}
            accessibilityRole="button"
            accessibilityState={{
              selected,
            }}
            accessibilityLabel={item.label}
            onPress={() => onNavigate(item.route)}
            style={({ pressed }) => [
              styles.item,
              {
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: selected
                    ? theme.colors.secondary
                    : 'transparent',
                },
              ]}
            >
              <AppIcon
                name={item.icon}
                size={iconSize.sm}
                color={color}
                strokeWidth={selected ? 2.4 : 2}
              />
            </View>

            <AppText variant="caption" color={color} style={styles.label}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '500',
  },
});
