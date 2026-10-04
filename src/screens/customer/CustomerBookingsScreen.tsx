import React, {
  useMemo,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  BookingCard,
} from '../../components/customer';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import {
  useCustomerBookings,
} from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import {
  Booking,
} from '../../types/booking';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props = BottomTabScreenProps<
  CustomerTabParamList,
  'CustomerBookings'
>;

type BookingTab =
  | 'active'
  | 'all'
  | 'cancelled'
  | 'completed';

const ACTIVE =
  new Set([
    'pending',
    'accepted',
    'in_progress',
  ]);

function matches(
  booking: Booking,
  tab: BookingTab,
): boolean {
  if (tab === 'all') {
    return true;
  }

  if (tab === 'active') {
    return ACTIVE.has(
      booking.status,
    );
  }

  return booking.status === tab;
}

export function CustomerBookingsScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();
  const [tab, setTab] =
    useState<BookingTab>('active');

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCustomerBookings();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const tabs =
    useMemo(
      () => [
        {
          key: 'active' as const,
          label: 'Active',
          count: data.filter(
            booking =>
              matches(
                booking,
                'active',
              ),
          ).length,
        },
        {
          key: 'all' as const,
          label: 'All',
          count: data.length,
        },
        {
          key: 'cancelled' as const,
          label: 'Cancelled',
          count: data.filter(
            booking =>
              booking.status ===
              'cancelled',
          ).length,
        },
        {
          key: 'completed' as const,
          label: 'Completed',
          count: data.filter(
            booking =>
              booking.status ===
              'completed',
          ).length,
        },
      ],
      [data],
    );

  const visible =
    useMemo(
      () =>
        data.filter(booking =>
          matches(booking, tab),
        ),
      [data, tab],
    );

  return (
    <ScrollView
      style={{
        backgroundColor:
          theme.colors.background,
      }}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}>
      <AppText variant="h1">
        Bookings
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Track your real Localsewa service requests and their current status.
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.tabs
        }>
        {tabs.map(item => {
          const active =
            item.key === tab;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{
                selected: active,
              }}
              onPress={() =>
                setTab(item.key)
              }
              style={[
                styles.tab,
                {
                  backgroundColor:
                    active
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor:
                    active
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}>
              <AppText
                variant="title"
                color={
                  active
                    ? '#FFFFFF'
                    : theme.colors.text
                }>
                {item.count}
              </AppText>

              <AppText
                variant="caption"
                color={
                  active
                    ? '#FFFFFF'
                    : theme.colors.textMuted
                }>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {isLoading ? (
          [0, 1, 2].map(index => (
            <Card key={index}>
              <Skeleton
                width="60%"
                height={20}
              />
              <Skeleton
                width="85%"
                height={14}
                style={styles.skeletonGap}
              />
              <Skeleton
                width="100%"
                height={50}
                style={styles.skeletonGap}
              />
            </Card>
          ))
        ) : error ? (
          <>
            <AlertBanner variant="error">
              {errorMessage(error)}
            </AlertBanner>

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
              onPress={() =>
                stack?.navigate(
                  'BookingDetails',
                  {
                    bookingId:
                      booking.id,
                  },
                )
              }
            />
          ))
        ) : (
          <Card>
            <AppText variant="title">
              {tab === 'active'
                ? 'No active bookings'
                : `No ${tab} bookings`}
            </AppText>

            <AppText
              variant="bodySmall"
              muted
              style={styles.emptyText}>
              Your matching bookings will appear here automatically.
            </AppText>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  tabs: {
    gap: spacing[2],
    paddingVertical: spacing[5],
  },
  tab: {
    minWidth: 88,
    minHeight: 70,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing[3],
  },
  skeletonGap: {
    marginTop: spacing[3],
  },
  emptyText: {
    marginTop: spacing[2],
  },
});
