import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Modal,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import {
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';
import { AppNotification } from '../../types/notification';
import { resolveNotificationTarget } from '../../utils/notificationRoute';
import {
  radius,
  shadows,
  spacing,
  useAppTheme,
} from '../../theme';
import { AppIcon, iconSize } from '../icons';
import {
  AlertBanner,
  AppText,
  Button,
  Skeleton,
} from '../ui';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type NotificationGroup = {
  key: string;
  label: string;
  items: AppNotification[];
};

export function ProviderNotificationsModal({
  visible,
  onClose,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  useEffect(() => {
    NativeModules.NotificationBackdrop?.setBlurred?.(visible);

    return () => {
      NativeModules.NotificationBackdrop?.setBlurred?.(false);
    };
  }, [visible]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useNotifications();

  const markRead = useMarkNotificationRead();

  const [actionError, setActionError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const notifications = useMemo(
    () =>
      (data?.notifications ?? []).filter(
        item => resolveNotificationTarget(item).workspace === 'provider',
      ),
    [data?.notifications],
  );

  const groups = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    [notifications],
  );

  async function openNotification(item: AppNotification) {
    setActionError(null);

    if (!item.read) {
      try {
        await markRead.mutateAsync(item.id);
      } catch (mutationError) {
        setActionError(errorMessage(mutationError));
      }
    }
  }

  async function readAllProviderNotifications() {
    const unread = notifications.filter(item => !item.read);

    if (!unread.length || markingAll) {
      return;
    }

    setActionError(null);
    setMarkingAll(true);

    try {
      for (const item of unread) {
        await markRead.mutateAsync(item.id);
      }
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
            },
            shadows.md,
          ]}
        >
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.headingCopy}>
              <AppText variant="h2">Notifications</AppText>

              <AppText
                variant="caption"
                muted
                style={styles.subtitle}
              >
                Provider booking and workspace updates appear automatically.
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                },
              ]}
            >
              <AppIcon
                name="x"
                size={iconSize.sm}
                color={theme.colors.textMuted}
              />
            </Pressable>
          </View>

          <View
            style={[
              styles.statusBar,
              {
                backgroundColor: '#F0F5F3',
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              color={theme.colors.textSecondary}
            >
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </AppText>

            {unreadCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                disabled={markingAll}
                onPress={readAllProviderNotifications}
              >
                <AppText
                  variant="label"
                  color={theme.colors.primary}
                >
                  {markingAll ? 'Marking…' : 'Mark all read'}
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {actionError ? (
            <View style={styles.banner}>
              <AlertBanner variant="error">
                {actionError}
              </AlertBanner>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              [0, 1, 2, 3].map(value => (
                <View
                  key={value}
                  style={[
                    styles.notificationCard,
                    {
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Skeleton width="56%" height={16} />
                  <Skeleton
                    width="92%"
                    height={12}
                    style={styles.skeletonGap}
                  />
                </View>
              ))
            ) : error ? (
              <View style={styles.errorWrap}>
                <AlertBanner variant="error">
                  {errorMessage(error)}
                </AlertBanner>

                <Button
                  label="Retry"
                  loading={isRefetching}
                  onPress={() => refetch()}
                  fullWidth
                />
              </View>
            ) : groups.length ? (
              groups.map(group => (
                <View key={group.key} style={styles.group}>
                  <AppText
                    variant="overline"
                    color="#8A9AB0"
                  >
                    {group.label}
                  </AppText>

                  <View style={styles.groupList}>
                    {group.items.map(item => (
                      <ProviderNotificationPopupRow
                        key={item.id}
                        item={item}
                        onPress={() => openNotification(item)}
                      />
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.empty}>
                <AppText variant="title">
                  No notifications yet
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  style={styles.subtitle}
                >
                  Provider booking and workspace activity will appear here.
                </AppText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProviderNotificationPopupRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void | Promise<void>;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationCard,
        {
          borderColor: item.read ? '#CEDBD5' : '#B8CCC3',
          backgroundColor: '#EDF3F0',
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <View style={styles.notificationTitleRow}>
        <AppText
          variant="label"
          numberOfLines={2}
          style={styles.notificationTitle}
        >
          {item.title}
        </AppText>

        {!item.read ? (
          <View
            style={[
              styles.notificationUnreadDot,
              {
                backgroundColor: '#214035',
              },
            ]}
          />
        ) : null}
      </View>

      <AppText
        variant="caption"
        color="#8492A8"
        style={styles.notificationTime}
      >
        {formatTime(item.createdAt)}
      </AppText>

      {item.message ? (
        <AppText
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={styles.message}
          numberOfLines={3}
        >
          {item.message}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function groupNotifications(items: AppNotification[]): NotificationGroup[] {
  const map = new Map<string, NotificationGroup>();

  items.forEach(item => {
    const date = parseDate(item.createdAt);

    const key = Number.isNaN(date.getTime())
      ? item.createdAt.slice(0, 10)
      : [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-');

    const existing = map.get(key);

    if (existing) {
      existing.items.push(item);
      return;
    }

    map.set(key, {
      key,
      label: formatDateLabel(date, item.createdAt),
      items: [item],
    });
  });

  return Array.from(map.values());
}

function parseDate(value: string): Date {
  return new Date(value);
}

function formatDateLabel(date: Date, fallback: string): string {
  if (Number.isNaN(date.getTime())) {
    return fallback.slice(0, 10).toUpperCase();
  }

  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(value: string): string {
  const date = parseDate(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${suffix}`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,24,17,0.24)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  sheet: {
    width: '100%',
    maxWidth: 460,
    height: '90%',
    maxHeight: '90%',
    borderRadius: 26,
    overflow: 'hidden',
  },
  header: {
    minHeight: 82,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headingCopy: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[1],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    minHeight: 42,
    borderBottomWidth: 1,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  banner: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
  },
  content: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[5],
  },
  group: {
    marginBottom: spacing[5],
  },
  groupList: {
    gap: spacing[2],
    marginTop: spacing[2],
  },
  notificationCard: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  notificationTitle: {
    flex: 1,
  },
  notificationUnreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  notificationTime: {
    marginTop: 4,
  },
  message: {
    marginTop: spacing[2],
  },
  skeletonGap: {
    marginTop: spacing[2],
  },
  errorWrap: {
    gap: spacing[3],
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[4],
  },
});
