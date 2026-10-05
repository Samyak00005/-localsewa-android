import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { NotificationRow } from '../../components/customer';
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
        // Navigation is still useful even if read-state mutation fails.
      }
    }

    const target = resolveNotificationTarget(item);

    if (target.workspace === 'provider') {
      if (!canUseProvider) {
        setActionError(
          'This notification targets the Provider workspace, but this account does not currently have Provider access.',
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

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <AppText variant="h1">Notifications</AppText>

          <AppText variant="body" muted style={styles.subtitle}>
            Booking, chat and account activity from Localsewa.
          </AppText>
        </View>

        {(data?.unreadCount ?? 0) > 0 ? (
          <View style={styles.readAll}>
            <Button
              label="Read all"
              variant="secondary"
              loading={markAll.isPending}
              onPress={readAll}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.summaryRow}>
        <AppText variant="label" color={theme.colors.primary}>
          {data?.unreadCount ?? 0} unread
        </AppText>

        {data?.serverTime ? (
          <AppText variant="caption" muted>
            Synced
          </AppText>
        ) : null}
      </View>

      {actionError ? (
        <View style={styles.sectionGap}>
          <AlertBanner variant="error">{actionError}</AlertBanner>
        </View>
      ) : null}

      <View style={styles.list}>
        {isLoading ? (
          [0, 1, 2, 3].map(index => (
            <Card key={index}>
              <Skeleton width="65%" height={20} />
              <Skeleton width="95%" height={14} style={styles.skeletonGap} />
              <Skeleton width="45%" height={12} style={styles.skeletonGap} />
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
          <Card>
            <AppText variant="title">You're all caught up</AppText>

            <AppText variant="bodySmall" muted style={styles.subtitle}>
              New Localsewa activity will appear here while you use the app.
            </AppText>
          </Card>
        )}
      </View>

      <Card style={styles.infoCard}>
        <AppText variant="label">In-app notifications</AppText>

        <AppText variant="caption" muted style={styles.subtitle}>
          Android push notifications are intentionally on hold. This screen
          refreshes the existing Localsewa notification feed while the app is
          running.
        </AppText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headingCopy: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[2],
  },
  readAll: {
    minWidth: 96,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[5],
  },
  sectionGap: {
    marginTop: spacing[4],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  skeletonGap: {
    marginTop: spacing[3],
  },
  infoCard: {
    marginTop: spacing[6],
  },
});
