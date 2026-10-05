import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import {
  BookingStatusBadge,
  InlineBookingReview,
} from '../../components/customer';
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
import {
  useCancelBooking,
  useCustomerBookings,
} from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { layout, radius, shadows, spacing, useAppTheme } from '../../theme';
import { Booking, BookingStatus } from '../../types/booking';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookingDetails'>;

function money(value: number | null): string | null {
  if (value == null) {
    return null;
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  const year = Number(match[1]);

  const month = Number(match[2]);

  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  return `${weekdays[date.getDay()]}, ${day} ${months[month - 1]}, ${year}`;
}

function formatTime(value: string): string {
  if (!value) {
    return '—';
  }

  const [hoursRaw, minutes = '00'] = value.split(':');

  const hours = Number(hoursRaw);

  if (!Number.isFinite(hours)) {
    return value;
  }

  const suffix = hours >= 12 ? 'pm' : 'am';

  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.slice(0, 2)} ${suffix}`;
}

function statusMessage(status: BookingStatus): {
  title: string;
  body?: string;
  background: string;
  border: string;
  color: string;
} {
  switch (status) {
    case 'pending':
      return {
        title: 'Waiting for provider response',
        body: 'Chat and call become available after the provider accepts.',
        background: '#FFF9E8',
        border: '#F5DF9F',
        color: '#8A6500',
      };

    case 'accepted':
      return {
        title: 'Provider accepted this booking',
        body: 'You can use in-app chat or the call preview from this booking.',
        background: '#EEF4FF',
        border: '#D8E4FF',
        color: '#2457C5',
      };

    case 'in_progress':
      return {
        title: 'Service is currently underway',
        background: '#ECFAF1',
        border: '#C8EBD6',
        color: '#087443',
      };

    case 'completed':
      return {
        title: 'Service completed',
        background: '#ECFAF1',
        border: '#C8EBD6',
        color: '#087443',
      };

    case 'cancelled':
      return {
        title: 'Booking canceled',
        background: '#F6F8FA',
        border: '#DDE3E7',
        color: '#53646B',
      };

    case 'rejected':
      return {
        title: 'Provider could not accept this request',
        background: '#FFF4F3',
        border: '#F5D0CC',
        color: '#B42318',
      };

    case 'not_completed':
      return {
        title: 'Service was not completed',
        background: '#FFF7ED',
        border: '#F3D8B4',
        color: '#B45309',
      };
  }
}

export function BookingDetailsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCustomerBookings();

  const cancel = useCancelBooking();

  const booking = useMemo(
    () => data.find(item => item.id === route.params.bookingId),
    [data, route.params.bookingId],
  );

  function confirmCancel() {
    if (!booking || !booking.canCancel) {
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
            setActionError(null);

            try {
              await cancel.mutateAsync(booking.id);
            } catch (mutationError) {
              setActionError(errorMessage(mutationError));
            }
          },
        },
      ],
    );
  }

  async function openMap(url: string | null) {
    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      setActionError('Unable to open Maps on this device.');
    }
  }

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <CustomerHeader routeName="CustomerBookings" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="h1">Booking details</AppText>

        {isLoading ? (
          <BookingDetailsSkeleton />
        ) : error || !booking ? (
          <View style={styles.errorWrap}>
            <AlertBanner variant="error">
              {errorMessage(error ?? new Error('Booking could not be loaded.'))}
            </AlertBanner>

            <Button
              label="Retry"
              loading={isRefetching}
              onPress={() => refetch()}
              fullWidth
            />
          </View>
        ) : (
          <>
            {actionError ? (
              <View style={styles.alertWrap}>
                <AlertBanner variant="error">{actionError}</AlertBanner>
              </View>
            ) : null}

            <BookingIdentityCard booking={booking} />

            {booking.status !== 'completed' ? (
              <StatusCard booking={booking} />
            ) : null}

            <ScheduleCard booking={booking} />

            {booking.status !== 'completed' ||
            booking.location ||
            booking.area ||
            booking.mapsUrl ? (
              <ServiceLocationCard
                booking={booking}
                onOpen={() => openMap(booking.mapsUrl)}
              />
            ) : null}

            {booking.providerLocation ? (
              <ProviderLocationCard
                booking={booking}
                onOpen={() => openMap(booking.providerMapsUrl)}
              />
            ) : null}

            {booking.chatEnabled ? (
              <CommunicationCard
                onChat={() =>
                  navigation.navigate('BookingChat', {
                    bookingId: booking.id,
                  })
                }
                onCall={() =>
                  navigation.navigate('VoiceCallPreview', {
                    bookingId: booking.id,
                  })
                }
              />
            ) : null}

            {booking.servicePrice != null || booking.note || booking.reason ? (
              <ServiceDetailsCard booking={booking} />
            ) : null}

            <View style={styles.actions}>
              {booking.canRebook && booking.providerId ? (
                <Button
                  label="Book again"
                  icon="calendar"
                  onPress={() =>
                    navigation.navigate('BookingRequest', {
                      providerId: booking.providerId,
                    })
                  }
                  fullWidth
                />
              ) : null}

              {booking.canCancel ? (
                <Button
                  label="Cancel booking"
                  icon="trash"
                  variant="destructive"
                  loading={cancel.isPending}
                  onPress={confirmCancel}
                  fullWidth
                />
              ) : null}
            </View>

            {booking.status === 'completed' ? (
              <InlineBookingReview
                bookingId={booking.id}
                canRate={booking.canRate}
                rating={booking.rating}
                reviewComment={booking.reviewComment}
              />
            ) : null}
          </>
        )}
      </ScrollView>

      <CustomerDetailBottomBar
        activeRoute="CustomerBookings"
        onNavigate={tab =>
          navigation.navigate('CustomerTabs', {
            screen: tab,
          })
        }
      />
    </View>
  );
}

function BookingIdentityCard({
  booking,
}: {
  booking: Booking;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.identityCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.identityTop}>
        <View style={styles.identityRow}>
          {booking.providerImage ? (
            <Image
              source={{
                uri: booking.providerImage,
              }}
              style={styles.providerImage}
            />
          ) : (
            <View
              style={[
                styles.providerFallback,
                {
                  backgroundColor: theme.colors.secondary,
                },
              ]}
            >
              <AppIcon
                name="calendar"
                size={iconSize.md}
                color={theme.colors.primary}
              />
            </View>
          )}

          <View style={styles.identityCopy}>
            <AppText variant="title" numberOfLines={1}>
              {booking.providerName}
            </AppText>

            <AppText
              variant="bodySmall"
              color={theme.colors.textSecondary}
              numberOfLines={2}
              style={styles.smallGap}
            >
              {booking.serviceName}
            </AppText>

            {booking.isCustomService ? (
              <AppText
                variant="overline"
                color="#6941C6"
                style={styles.customLabel}
              >
                CUSTOM SERVICE REQUEST
              </AppText>
            ) : null}
          </View>
        </View>

        <BookingStatusBadge status={booking.status} />
      </View>

      <View
        style={[
          styles.identityDivider,
          {
            backgroundColor: theme.colors.border,
          },
        ]}
      />

      <View style={styles.bookingCodeRow}>
        <AppText variant="caption" muted>
          Booking ID
        </AppText>

        <AppText variant="label" numberOfLines={1}>
          {booking.bookingCode}
        </AppText>
      </View>
    </View>
  );
}

function StatusCard({ booking }: { booking: Booking }): React.JSX.Element {
  const state = statusMessage(booking.status);

  return (
    <View
      style={[
        styles.statusCard,
        {
          backgroundColor: state.background,
          borderColor: state.border,
        },
      ]}
    >
      <View style={styles.statusHeading}>
        {booking.status === 'in_progress' ? (
          <View style={styles.liveDot} />
        ) : (
          <AppIcon name="checkCircle" size={iconSize.sm} color={state.color} />
        )}

        <AppText variant="label" color={state.color} style={styles.statusTitle}>
          {state.title}
        </AppText>
      </View>

      {state.body ? (
        <AppText
          variant="caption"
          color={state.color}
          style={styles.statusBody}
        >
          {state.body}
        </AppText>
      ) : null}
    </View>
  );
}

function ScheduleCard({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <Card style={styles.sectionCard}>
      <AppText variant="title">Schedule</AppText>

      <View style={styles.scheduleGrid}>
        <DetailTile
          icon="calendar"
          label="Date"
          value={formatDate(booking.date)}
        />

        <DetailTile
          icon="clock"
          label="Time"
          value={formatTime(booking.time)}
        />
      </View>

      {booking.distanceLabel ? (
        <View style={styles.distanceRow}>
          <AppIcon name="mapPin" size={14} color="#66776E" />

          <AppText variant="caption" muted style={styles.distanceText}>
            {booking.distanceLabel}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

function ServiceLocationCard({
  booking,
  onOpen,
}: {
  booking: Booking;
  onOpen: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  const location = booking.location || booking.area;

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor: theme.colors.secondary,
            },
          ]}
        >
          <AppIcon
            name="mapPin"
            size={iconSize.sm}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.sectionTitleCopy}>
          <AppText variant="title">Service address</AppText>

          <AppText
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={styles.sectionText}
          >
            {location || 'Location is hidden for this booking state.'}
          </AppText>
        </View>
      </View>

      {booking.mapsUrl ? (
        <Button
          label="Open service address"
          icon="mapPin"
          variant="outline"
          onPress={onOpen}
          fullWidth
        />
      ) : null}
    </Card>
  );
}

function ProviderLocationCard({
  booking,
  onOpen,
}: {
  booking: Booking;
  onOpen: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor: theme.colors.secondary,
            },
          ]}
        >
          <AppIcon
            name="mapPin"
            size={iconSize.sm}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.sectionTitleCopy}>
          <AppText variant="title">Provider location</AppText>

          <AppText
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={styles.sectionText}
          >
            {booking.providerLocation}
          </AppText>
        </View>
      </View>

      {booking.providerMapsUrl ? (
        <Button
          label="Open provider location"
          icon="mapPin"
          variant="outline"
          onPress={onOpen}
          fullWidth
        />
      ) : null}
    </Card>
  );
}

function CommunicationCard({
  onChat,
  onCall,
}: {
  onChat: () => void;
  onCall: () => void;
}): React.JSX.Element {
  return (
    <Card style={styles.sectionCard}>
      <AppText variant="title">Contact provider</AppText>

      <View style={styles.communicationRow}>
        <View style={styles.communicationAction}>
          <Button
            label="In-app chat"
            icon="message"
            onPress={onChat}
            fullWidth
          />
        </View>

        <View style={styles.communicationAction}>
          <Button
            label="Call"
            icon="phone"
            variant="outline"
            onPress={onCall}
            fullWidth
          />
        </View>
      </View>
    </Card>
  );
}

function ServiceDetailsCard({
  booking,
}: {
  booking: Booking;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  const servicePrice = money(booking.servicePrice);

  return (
    <Card style={styles.sectionCard}>
      <AppText variant="title">Service details</AppText>

      {servicePrice ? (
        <View style={styles.priceRow}>
          <AppText variant="caption" muted>
            Service price
          </AppText>

          <AppText variant="h3" color={theme.colors.primary}>
            {servicePrice}
          </AppText>
        </View>
      ) : null}

      {booking.note ? (
        <View
          style={[
            styles.noteBox,
            {
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <AppText variant="label">Your note</AppText>

          <AppText
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={styles.smallGap}
          >
            {booking.note}
          </AppText>
        </View>
      ) : null}

      {booking.reason ? (
        <ReasonCard status={booking.status} reason={booking.reason} />
      ) : null}
    </Card>
  );
}

function ReasonCard({
  status,
  reason,
}: {
  status: BookingStatus;
  reason: string;
}): React.JSX.Element {
  const config =
    status === 'rejected'
      ? {
          title: 'Provider reason',
          background: '#FFF4F3',
          border: '#F5D0CC',
          color: '#B42318',
        }
      : status === 'not_completed'
      ? {
          title: 'Not completed reason',
          background: '#FFF7ED',
          border: '#F3D8B4',
          color: '#B45309',
        }
      : {
          title: 'Reason',
          background: '#F6F8FA',
          border: '#DDE3E7',
          color: '#53646B',
        };

  return (
    <View
      style={[
        styles.reasonBox,
        {
          backgroundColor: config.background,
          borderColor: config.border,
        },
      ]}
    >
      <AppText variant="label" color={config.color}>
        {config.title}
      </AppText>

      <AppText variant="bodySmall" color={config.color} style={styles.smallGap}>
        {reason}
      </AppText>
    </View>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: 'calendar' | 'clock';
  label: string;
  value: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.detailTile,
        {
          backgroundColor: theme.colors.surfaceMuted,
        },
      ]}
    >
      <View
        style={[
          styles.detailIcon,
          {
            backgroundColor: theme.colors.secondary,
          },
        ]}
      >
        <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      </View>

      <View style={styles.detailCopy}>
        <AppText variant="caption" muted>
          {label}
        </AppText>

        <AppText variant="label" numberOfLines={2} style={styles.smallGap}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

function BookingDetailsSkeleton(): React.JSX.Element {
  return (
    <View style={styles.skeletonList}>
      <Card style={styles.skeletonCard}>
        <View style={styles.skeletonIdentity}>
          <Skeleton width={56} height={56} radiusValue={28} />

          <View style={styles.skeletonCopy}>
            <Skeleton width="58%" height={18} />

            <Skeleton width="78%" height={13} style={styles.skeletonGap} />

            <Skeleton width="46%" height={11} style={styles.skeletonGap} />
          </View>
        </View>
      </Card>

      <Card style={styles.skeletonCard}>
        <Skeleton width="52%" height={18} />

        <Skeleton width="100%" height={70} style={styles.skeletonLargeGap} />
      </Card>

      <Card style={styles.skeletonCard}>
        <Skeleton width="38%" height={18} />

        <Skeleton width="100%" height={90} style={styles.skeletonLargeGap} />
      </Card>
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
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  errorWrap: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  alertWrap: {
    marginTop: spacing[4],
  },
  identityCard: {
    marginTop: spacing[5],
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing[4],
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  identityRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  providerFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  customLabel: {
    marginTop: spacing[2],
    letterSpacing: 0.5,
  },
  identityDivider: {
    height: 1,
    marginTop: spacing[4],
  },
  bookingCodeRow: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  statusCard: {
    marginTop: spacing[4],
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[3],
  },
  statusHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusTitle: {
    flex: 1,
  },
  statusBody: {
    marginTop: spacing[1],
    paddingLeft: 28,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#24C56A',
  },
  sectionCard: {
    marginTop: spacing[4],
    gap: spacing[4],
  },
  scheduleGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  detailTile: {
    flex: 1,
    minWidth: 0,
    minHeight: 82,
    borderRadius: radius.md,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  distanceText: {
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleCopy: {
    flex: 1,
  },
  sectionText: {
    marginTop: spacing[1],
  },
  communicationRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  communicationAction: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  noteBox: {
    borderRadius: radius.md,
    padding: spacing[3],
  },
  reasonBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  actions: {
    marginTop: spacing[5],
    gap: spacing[3],
  },
  skeletonList: {
    marginTop: spacing[5],
    gap: spacing[4],
  },
  skeletonCard: {
    borderRadius: radius.xl,
  },
  skeletonIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
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
});
