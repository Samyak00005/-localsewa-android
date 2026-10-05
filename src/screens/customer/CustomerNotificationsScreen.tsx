import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { NotificationRow } from '../../components/customer';
import { AppIcon, iconSize } from '../../components/icons';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { useCustomerBookings } from '../../hooks/useCustomerData';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';
import { CustomerStackParamList } from '../../navigation/types';
import { layout, spacing, useAppTheme } from '../../theme';
import { AppNotification } from '../../types/notification';
import { resolveNotificationTarget } from '../../utils/notificationRoute';

type Props = NativeStackScreenProps<CustomerStackParamList, 'Notifications'>;

export function CustomerNotificationsScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const { canUseProvider, enterProvider } = useAppShell();
  const { data, isLoading, error, refetch, isRefetching } = useNotifications();
  const { data: bookings = [] } = useCustomerBookings();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [actionError, setActionError] = useState<string | null>(null);

  async function openNotification(item: AppNotification) {
    setActionError(null);

    if (!item.read) {
      try {
        await markRead.mutateAsync(item.id);
      } catch {
        // Navigation remains useful even if read-state mutation fails.
      }
    }

    const target = resolveNotificationTarget(item);

    if (target.workspace === 'provider') {
      if (!canUseProvider) {
        setActionError(
          'This update belongs to the Provider workspace, but this account does not currently have Provider access.',
        );
        return;
      }

      enterProvider();
      return;
    }

    if (target.route === 'BookingDetails' && target.bookingId) {
      navigation.navigate('BookingDetails', {
        bookingId: target.bookingId,
      });
      return;
    }

    if (target.route === 'BookingChat' && target.bookingId) {
      const booking = bookings.find(item => item.id === target.bookingId);

      if (booking && booking.chatEnabled) {
        navigation.navigate('BookingChat', {
          bookingId: target.bookingId,
        });
      } else {
        navigation.navigate('BookingDetails', {
          bookingId: target.bookingId,
        });
      }

      return;
    }

    if (target.route === 'CustomerBookings') {
      navigation.navigate('CustomerTabs', {
        screen: 'CustomerBookings',
      });
    }
  }

  async function readAll() {
    setActionError(null);

    try {
      await markAll.mutateAsync();
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    }
  }

  function navigateTab(
    tab:
      | 'CustomerHome'
      | 'CustomerServices'
      | 'CustomerBookings'
      | 'CustomerSaved'
      | 'CustomerProfile',
  ) {
    navigation.navigate('CustomerTabs', {
      screen: tab,
    });
  }

  const unread = data?.unreadCount ?? 0;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <CustomerHeader routeName="CustomerHome" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <AppText variant="h1">Notifications</AppText>
            <AppText variant="body" muted style={styles.subtitle}>
              Booking, chat and account updates from Localsewa.
            </AppText>
          </View>

          <View
            style={[
              styles.unreadPill,
              {
                backgroundColor: unread > 0
                  ? theme.colors.secondary
                  : theme.colors.surfaceMuted,
              },
            ]}
          >
            <AppIcon
              name="bell"
              size={iconSize.xs}
              color={unread > 0 ? theme.colors.primary : theme.colors.textMuted}
            />
            <AppText
              variant="label"
              color={unread > 0 ? theme.colors.primary : theme.colors.textMuted}
            >
              {unread}
            </AppText>
          </View>
        </View>

        {unread > 0 ? (
          <View style={styles.readAllRow}>
            <AppText variant="caption" muted>
              {unread} unread {unread === 1 ? 'update' : 'updates'}
            </AppText>

            <Button
              label="Mark all read"
              variant="secondary"
              loading={markAll.isPending}
              onPress={readAll}
            />
          </View>
        ) : (
          <View style={styles.readAllRow}>
            <AppText variant="caption" muted>
              You're all caught up
            </AppText>
          </View>
        )}

        {actionError ? (
          <View style={styles.sectionGap}>
            <AlertBanner variant="error">{actionError}</AlertBanner>
          </View>
        ) : null}

        <View style={styles.list}>
          {isLoading ? (
            [0, 1, 2, 3].map(index => (
              <Card key={index} style={styles.skeletonCard}>
                <Skeleton width="62%" height={18} />
                <Skeleton width="94%" height={14} style={styles.skeletonGap} />
                <Skeleton width="46%" height={12} style={styles.skeletonGap} />
              </Card>
            ))
          ) : error ? (
            <>
              <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
              <Button
                label="Retry"
                loading={isRefetching}
                onPress={() => {
                  refetch();
                }}
                fullWidth
              />
            </>
          ) : data?.notifications.length ? (
            data.notifications.map(item => (
              <NotificationRow
                key={item.id}
                notification={item}
                onPress={() => {
                  openNotification(item);
                }}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View
                style={[
                  styles.emptyIcon,
                  {
                    backgroundColor: theme.colors.secondary,
                  },
                ]}
              >
                <AppIcon
                  name="bell"
                  size={iconSize.lg}
                  color={theme.colors.primary}
                />
              </View>

              <AppText variant="title" style={styles.emptyTitle}>
                You're all caught up
              </AppText>

              <AppText variant="bodySmall" muted style={styles.emptyText}>
                New booking, chat and account activity will appear here.
              </AppText>
            </Card>
          )}
        </View>
      </ScrollView>

      <CustomerDetailBottomBar
        activeRoute="CustomerHome"
        onNavigate={navigateTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: spacing[2],
  },
  unreadPill: {
    minWidth: 48,
    height: 38,
    borderRadius: 999,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  readAllRow: {
    minHeight: 48,
    marginTop: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  sectionGap: {
    marginTop: spacing[3],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  skeletonCard: {
    borderRadius: 18,
  },
  skeletonGap: {
    marginTop: spacing[3],
  },
  emptyCard: {
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: spacing[7],
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: spacing[4],
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spacing[2],
    textAlign: 'center',
    maxWidth: 280,
  },
});
