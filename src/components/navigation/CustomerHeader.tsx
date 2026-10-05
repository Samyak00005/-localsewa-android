import React, { useState } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CUSTOMER_HOME_GREEN } from '../../constants/customerUi';
import { useNotifications } from '../../hooks/useNotifications';
import { CustomerTabParamList } from '../../navigation/types';
import { spacing, useAppTheme } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { AppText } from '../ui';
import { CustomerNotificationsModal } from './CustomerNotificationsModal';
import { CustomerSidebar } from './CustomerSidebar';

type Props = {
  routeName: keyof CustomerTabParamList;
};

export function CustomerHeader({
  routeName: _routeName,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const insets = useSafeAreaInsets();

  const { data: notifications } = useNotifications();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const background = CUSTOMER_HOME_GREEN;

  const iconColor = '#FFFFFF';

  const unread = notifications?.unreadCount ?? 0;

  return (
    <>
      <View
        style={[
          styles.shell,
          {
            backgroundColor: background,
            paddingTop: insets.top,
            borderBottomColor: CUSTOMER_HOME_GREEN,
          },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor={background} />

        <View style={styles.header}>
          <Image
            source={require('../../assets/branding/localsewa-mark.png')}
            resizeMode="cover"
            style={styles.mark}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
              }
              hitSlop={8}
              onPress={() => setNotificationsOpen(true)}
              style={({ pressed }) => [
                styles.bareButton,
                {
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <AppIcon name="bell" size={23} color={iconColor} />

              {unread > 0 ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: theme.colors.error,
                      borderColor: background,
                    },
                  ]}
                >
                  <AppText variant="overline" color="#FFFFFF">
                    {unread > 99 ? '99+' : String(unread)}
                  </AppText>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={8}
              onPress={() => setSidebarOpen(true)}
              style={({ pressed }) => [
                styles.bareButton,
                {
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <AppIcon name="menu" size={iconSize.md} color={iconColor} />
            </Pressable>
          </View>
        </View>
      </View>

      <CustomerNotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <CustomerSidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderBottomWidth: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  bareButton: {
    width: 42,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
