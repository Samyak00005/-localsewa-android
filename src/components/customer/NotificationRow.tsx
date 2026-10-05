import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '../../theme';
import { AppNotification } from '../../types/notification';
import { AppIcon, AppIconName, iconSize } from '../icons';
import { AppText } from '../ui';

type Props = {
  notification: AppNotification;
  onPress: () => void;
};

function dateTime(value: string): string {
  if (!value) {
    return '';
  }

  return value.replace('T', ' ').slice(0, 16);
}

function notificationIcon(type: string): AppIconName {
  const value = type.toLowerCase();

  if (value.includes('chat') || value.includes('message')) {
    return 'message';
  }

  if (value.includes('booking')) {
    return 'calendar';
  }

  if (value.includes('security') || value.includes('account')) {
    return 'shieldCheck';
  }

  return 'bell';
}

export function NotificationRow({
  notification,
  onPress,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: notification.read
            ? theme.colors.surface
            : theme.colors.secondary,
          borderColor: notification.read
            ? theme.colors.border
            : theme.colors.primary,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: notification.read
              ? theme.colors.surfaceMuted
              : theme.colors.surface,
          },
        ]}
      >
        <AppIcon
          name={notificationIcon(notification.type)}
          size={iconSize.sm}
          color={
            notification.read ? theme.colors.textMuted : theme.colors.primary
          }
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="title" numberOfLines={2} style={styles.title}>
            {notification.title}
          </AppText>

          {!notification.read ? (
            <AppText variant="overline" color={theme.colors.primary}>
              NEW
            </AppText>
          ) : null}
        </View>

        {notification.message ? (
          <AppText
            variant="bodySmall"
            muted
            numberOfLines={3}
            style={styles.message}
          >
            {notification.message}
          </AppText>
        ) : null}

        <View style={styles.meta}>
          <AppText variant="caption" muted>
            {notification.type.replace(/[_-]+/g, ' ').toUpperCase()}
          </AppText>
          <AppText variant="caption" muted>
            {dateTime(notification.createdAt)}
          </AppText>
        </View>
      </View>

      <AppIcon
        name="chevronRight"
        size={iconSize.sm}
        color={theme.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  title: {
    flex: 1,
  },
  message: {
    marginTop: spacing[2],
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[3],
  },
});
