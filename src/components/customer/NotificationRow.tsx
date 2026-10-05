import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '../../theme';
import { AppNotification } from '../../types/notification';
import { resolveNotificationTarget } from '../../utils/notificationRoute';
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

  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T|\s)(\d{2}):(\d{2})/.exec(value);

  if (!match) {
    return value.replace('T', ' ').slice(0, 16);
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = Number(match[2]);
  const hours = Number(match[4]);
  const suffix = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;

  return `${Number(match[3])} ${months[month - 1] ?? match[2]} · ${hour12}:${match[5]} ${suffix}`;
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
  const workspace = resolveNotificationTarget(notification).workspace;
  const providerNotification = workspace === 'provider';

  const roleBackground = providerNotification
    ? '#EDF3F0'
    : '#F2FBF6';

  const roleBorder = providerNotification
    ? '#CEDBD5'
    : '#CDE9D8';

  const roleAccent = providerNotification
    ? '#214035'
    : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: roleBackground,
          borderColor: notification.read
            ? roleBorder
            : providerNotification
              ? '#B8CCC3'
              : '#B7DEC7',
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: providerNotification
              ? '#DDE8E3'
              : '#E4F6EB',
          },
        ]}
      >
        <AppIcon
          name={notificationIcon(notification.type)}
          size={iconSize.sm}
          color={notification.read ? theme.colors.textMuted : roleAccent}
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="label" numberOfLines={2} style={styles.title}>
            {notification.title}
          </AppText>

          {!notification.read ? <View style={styles.unreadDot} /> : null}
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

        <View style={styles.metaRow}>
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
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 18,
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
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#20A85A',
  },
  message: {
    marginTop: spacing[1],
  },
  metaRow: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
});
