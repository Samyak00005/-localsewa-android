import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { BookingCard } from '../../components/customer';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import {
  useCancelBooking,
  useCustomerBookings,
} from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { Booking, BookingStatus } from '../../types/booking';

type Props = BottomTabScreenProps<CustomerTabParamList, 'CustomerBookings'>;

type BookingTab = 'all' | 'active' | 'canceled' | 'completed';

const ACTIVE = new Set<BookingStatus>(['pending', 'accepted', 'in_progress']);

const CANCELED = new Set<BookingStatus>([
  'cancelled',
  'rejected',
  'not_completed',
]);

function matches(booking: Booking, tab: BookingTab): boolean {
  switch (tab) {
    case 'all':
      return true;

    case 'active':
      return ACTIVE.has(booking.status);

    case 'canceled':
      return CANCELED.has(booking.status);

    case 'completed':
      return booking.status === 'completed';
  }
}

function timestamp(booking: Booking): number {
  const value = `${booking.date}T${booking.time || '00:00:00'}`;

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function CustomerBookingsScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const [tab, setTab] = useState<BookingTab>('all');

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCustomerBookings();

  const cancel = useCancelBooking();

  const stack =
    navigation.getParent<NativeStackNavigationProp<CustomerStackParamList>>();

  const tabs = useMemo(
    () => [
      {
        key: 'all' as const,
        label: 'All',
        count: data.length,
      },
      {
        key: 'active' as const,
        label: 'Active',
        count: data.filter(booking => matches(booking, 'active')).length,
      },
      {
        key: 'canceled' as const,
        label: 'Canceled',
        count: data.filter(booking => matches(booking, 'canceled')).length,
      },
      {
        key: 'completed' as const,
        label: 'Completed',
        count: data.filter(booking => matches(booking, 'completed')).length,
      },
    ],
    [data],
  );

  const visible = useMemo(
    () =>
      data
        .filter(booking => matches(booking, tab))
        .sort((a, b) => timestamp(b) - timestamp(a)),
    [data, tab],
  );

  function openDetails(booking: Booking) {
    stack?.navigate('BookingDetails', {
      bookingId: booking.id,
    });
  }

  function openChat(booking: Booking) {
    stack?.navigate('BookingChat', {
      bookingId: booking.id,
    });
  }

  function openCall(booking: Booking) {
    stack?.navigate('VoiceCallPreview', {
      bookingId: booking.id,
    });
  }

  function rebook(booking: Booking) {
    if (!booking.providerId) {
      return;
    }

    stack?.navigate('BookingRequest', {
      providerId: booking.providerId,
    });
  }

  async function openLocation(booking: Booking) {
    if (!booking.mapsUrl) {
      return;
    }

    try {
      await Linking.openURL(booking.mapsUrl);
    } catch {
      Alert.alert('Service location', 'Unable to open Maps on this device.');
    }
  }

  function confirmCancel(booking: Booking) {
    if (!booking.canCancel || cancellingId != null) {
      return;
    }

    Alert.alert(
      'Cancel booking?',
      'This booking request will be cancelled and the provider will be notified.',
      [
        {
          text: 'Keep booking',
          style: 'cancel',
        },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);

            try {
              await cancel.mutateAsync(booking.id);
            } catch (mutationError) {
              Alert.alert('Cancel booking', errorMessage(mutationError));
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.surface}
        />
      }
    >
      <AppText variant="h1">Bookings</AppText>

      <AppText variant="body" muted style={styles.subtitle}>
        Track requests, contact accepted providers and manage completed
        services.
      </AppText>

      <View
        style={[
          styles.tabsShell,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {tabs.map(item => {
          const selected = item.key === tab;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{
                selected,
              }}
              onPress={() => setTab(item.key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: selected
                    ? theme.colors.primary
                    : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={selected ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.tabLabel}
              >
                {item.label}
              </AppText>

              <View
                style={[
                  styles.count,
                  {
                    backgroundColor: selected
                      ? 'rgba(255,255,255,0.18)'
                      : theme.colors.secondary,
                  },
                ]}
              >
                <AppText
                  variant="overline"
                  color={selected ? '#FFFFFF' : theme.colors.primary}
                >
                  {item.count}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {isLoading ? (
          [0, 1, 2].map(index => (
            <Card key={index} style={styles.skeletonCard}>
              <View style={styles.skeletonTop}>
                <Skeleton width={50} height={50} radiusValue={25} />

                <View style={styles.skeletonCopy}>
                  <Skeleton width="55%" height={18} />
                  <Skeleton
                    width="78%"
                    height={13}
                    style={styles.skeletonGap}
                  />
                </View>
              </View>

              <Skeleton
                width="100%"
                height={1}
                style={styles.skeletonLargeGap}
              />

              <Skeleton width="88%" height={14} style={styles.skeletonGap} />

              <Skeleton
                width="100%"
                height={48}
                style={styles.skeletonLargeGap}
              />
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
        ) : visible.length ? (
          visible.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => openDetails(booking)}
              onChat={booking.chatEnabled ? () => openChat(booking) : undefined}
              onCall={booking.chatEnabled ? () => openCall(booking) : undefined}
              onCancel={
                booking.canCancel ? () => confirmCancel(booking) : undefined
              }
              onRebook={
                booking.canRebook && booking.providerId
                  ? () => rebook(booking)
                  : undefined
              }
              onOpenLocation={
                booking.mapsUrl ? () => openLocation(booking) : undefined
              }
              cancelLoading={cancellingId === booking.id}
            />
          ))
        ) : (
          <EmptyBookings
            tab={tab}
            onBrowse={() => navigation.navigate('CustomerServices')}
          />
        )}
      </View>
    </ScrollView>
  );
}

function EmptyBookings({
  tab,
  onBrowse,
}: {
  tab: BookingTab;
  onBrowse: () => void;
}): React.JSX.Element {
  const copy =
    tab === 'active'
      ? {
          title: 'No active bookings',
          body: 'Accepted and in-progress services will appear here.',
        }
      : tab === 'canceled'
      ? {
          title: 'No canceled bookings',
          body: 'Canceled, rejected and not-completed requests will appear here.',
        }
      : tab === 'completed'
      ? {
          title: 'No completed services yet',
          body: 'Completed bookings and your ratings will appear here.',
        }
      : {
          title: "You haven't booked a service yet",
          body: 'Browse local services and send your first booking request.',
        };

  return (
    <Card style={styles.emptyCard}>
      <AppText variant="title">{copy.title}</AppText>

      <AppText variant="bodySmall" muted style={styles.emptyText}>
        {copy.body}
      </AppText>

      <View style={styles.emptyAction}>
        <Button
          label="Browse services"
          icon="servicesGrid"
          onPress={onBrowse}
          fullWidth
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  tabsShell: {
    marginTop: spacing[5],
    borderWidth: 1,
    borderRadius: 999,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 10.5,
    flexShrink: 1,
  },
  count: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  list: {
    gap: spacing[4],
    marginTop: spacing[6],
  },
  skeletonCard: {
    borderRadius: radius.xl,
  },
  skeletonTop: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  skeletonCopy: {
    flex: 1,
  },
  skeletonGap: {
    marginTop: spacing[2],
  },
  skeletonLargeGap: {
    marginTop: spacing[4],
  },
  emptyCard: {
    borderRadius: radius.xl,
    alignItems: 'stretch',
  },
  emptyText: {
    marginTop: spacing[2],
  },
  emptyAction: {
    marginTop: spacing[5],
  },
});
