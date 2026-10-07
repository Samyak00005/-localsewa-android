import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotifications } from '../../hooks/useNotifications';
import { resolveNotificationTarget } from '../../utils/notificationRoute';
import { spacing, useAppTheme } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { AppText } from '../ui';
import { ProviderNotificationsModal } from './ProviderNotificationsModal';

const logo = require('../../assets/branding/localsewa-mark.png');

export function ProviderHeader(): React.JSX.Element {
  const { theme } = useAppTheme();
  const { data } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadProviderCount = useMemo(
    () =>
      (data?.notifications ?? []).filter(
        item =>
          !item.read &&
          resolveNotificationTarget(item).workspace === 'provider',
      ).length,
    [data?.notifications],
  );

  return (
    <>
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safeArea, { backgroundColor: theme.colors.primary }]}
      >
        <View style={styles.header}>
          <Image source={logo} resizeMode="contain" style={styles.logo} />

          <View style={styles.workspace}>
            <AppText
              variant="overline"
              color="#CDE0D8"
              numberOfLines={1}
            >
              PROVIDER WORKSPACE
            </AppText>
            <AppText variant="label" color="#FFFFFF" numberOfLines={1}>
              Manage your local business
            </AppText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open provider notifications"
            onPress={() => setNotificationsOpen(true)}
            style={({ pressed }) => [
              styles.bellButton,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.18)',
                opacity: pressed ? 0.74 : 1,
              },
            ]}
          >
            <AppIcon name="bell" size={iconSize.sm} color="#FFFFFF" />

            {unreadProviderCount > 0 ? (
              <View style={styles.unreadBadge}>
                <AppText variant="caption" color="#FFFFFF">
                  {unreadProviderCount > 9 ? '9+' : String(unreadProviderCount)}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </SafeAreaView>

      <ProviderNotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  header: {
    minHeight: 66,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 9,
    flexShrink: 0,
  },
  workspace: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#D93B48',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
