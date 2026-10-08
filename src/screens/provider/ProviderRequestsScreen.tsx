import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { BookingStatusBadge } from '../../components/customer/BookingStatusBadge';
import { AppIcon, AppIconName, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Input,
  Skeleton,
} from '../../components/ui';
import { useManualRefresh } from '../../hooks/useManualRefresh';
import {
  useProviderBookings,
  useProviderBookingStatusUpdate,
  useProviderRequestCount,
} from '../../hooks/useProviderWorkspace';
import {
  ProviderStackParamList,
  ProviderTabParamList,
} from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { Booking, BookingStatus } from '../../types/booking';

type Props = BottomTabScreenProps<ProviderTabParamList, 'ProviderRequests'>;

type RequestFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'not_completed'
  | 'cancelled';

type ProviderActionStatus =
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'not_completed';

type RequestAction = {
  status: ProviderActionStatus;
  label: string;
  confirmLabel: string;
  reasonRequired?: boolean;
  primary?: boolean;
};

type ActionDialogState = {
  booking: Booking;
  action: RequestAction;
};

const PROVIDER_SURFACE_RADIUS = 28;
const FLOATING_SHEET_MARGIN = 12;

const FILTERS: Array<{ key: RequestFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'not_completed', label: 'Not completed' },
  { key: 'cancelled', label: 'Canceled' },
];

const STATUS_ORDER: Record<BookingStatus, number> = {
  pending: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
  rejected: 4,
  not_completed: 5,
  cancelled: 6,
};

function requestTimestamp(booking: Booking): number {
  const value = `${booking.date || '1970-01-01'}T${booking.time || '00:00:00'}`;
  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value || 'Date unavailable';
  }

  const month = [
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
  ][Number(match[2]) - 1];

  return `${Number(match[3])} ${month} ${match[1]}`;
}

function formatTime(value: string): string {
  if (!value) {
    return 'Time unavailable';
  }

  const [hourRaw, minuteRaw = '00'] = value.split(':');
  const hour = Number(hourRaw);

  if (!Number.isFinite(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minuteRaw.slice(0, 2)} ${suffix}`;
}

function formatPrice(value: number | null): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function matchesFilter(booking: Booking, filter: RequestFilter): boolean {
  return filter === 'all' || booking.status === filter;
}

function isActive(status: BookingStatus): boolean {
  return status === 'accepted' || status === 'in_progress';
}

function actionsFor(status: BookingStatus): RequestAction[] {
  if (status === 'pending') {
    return [
      {
        status: 'rejected',
        label: 'Reject',
        confirmLabel: 'Reject request',
        reasonRequired: true,
      },
      {
        status: 'accepted',
        label: 'Accept',
        confirmLabel: 'Accept request',
        primary: true,
      },
    ];
  }

  if (status === 'accepted') {
    return [
      {
        status: 'rejected',
        label: 'Reject',
        confirmLabel: 'Reject request',
        reasonRequired: true,
      },
      {
        status: 'in_progress',
        label: 'Start job',
        confirmLabel: 'Start job',
        primary: true,
      },
    ];
  }

  if (status === 'in_progress') {
    return [
      {
        status: 'not_completed',
        label: 'Not completed',
        confirmLabel: 'Mark not completed',
        reasonRequired: true,
      },
      {
        status: 'completed',
        label: 'Complete job',
        confirmLabel: 'Complete job',
        primary: true,
      },
    ];
  }

  return [];
}

export function ProviderRequestsScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const [filter, setFilter] = useState<RequestFilter>('all');
  const [filtersScrolled, setFiltersScrolled] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogState | null>(
    null,
  );
  const [reason, setReason] = useState('');
  const [dialogError, setDialogError] = useState<string | null>(null);

  const stack =
    navigation.getParent<NativeStackNavigationProp<ProviderStackParamList>>();

  const bookingsQuery = useProviderBookings();
  const requestCountQuery = useProviderRequestCount();
  const updateStatus = useProviderBookingStatusUpdate();
  const { refetch: refetchBookings } = bookingsQuery;
  const { refetch: refetchRequestCount } = requestCountQuery;

  const bookings = bookingsQuery.data ?? [];

  const counts = useMemo(() => {
    const pendingFromList = bookings.filter(item => item.status === 'pending').length;

    return {
      pending: requestCountQuery.data?.pendingCount ?? pendingFromList,
      active: bookings.filter(item => isActive(item.status)).length,
      completed: bookings.filter(item => item.status === 'completed').length,
    };
  }, [bookings, requestCountQuery.data?.pendingCount]);

  const filterCounts = useMemo(() => {
    const result: Record<RequestFilter, number> = {
      all: bookings.length,
      pending: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      not_completed: 0,
      cancelled: 0,
    };

    bookings.forEach(item => {
      result[item.status] += 1;
    });

    return result;
  }, [bookings]);

  const visibleBookings = useMemo(
    () =>
      bookings
        .filter(item => matchesFilter(item, filter))
        .slice()
        .sort((first, second) => {
          if (filter === 'all') {
            const rank = STATUS_ORDER[first.status] - STATUS_ORDER[second.status];

            if (rank !== 0) {
              return rank;
            }
          }

          return requestTimestamp(second) - requestTimestamp(first);
        }),
    [bookings, filter],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([refetchBookings(), refetchRequestCount()]);
  }, [refetchBookings, refetchRequestCount]);

  const pullRefresh = useManualRefresh(refreshAll);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  function openChat(booking: Booking) {
    stack?.navigate('ProviderBookingChat', { bookingId: booking.id });
  }

  function openCall(booking: Booking) {
    stack?.navigate('ProviderVoiceCallPreview', { bookingId: booking.id });
  }

  function openDetails(booking: Booking) {
    stack?.navigate('ProviderRequestDetails', { bookingId: booking.id });
  }

  async function openRoute(booking: Booking) {
    if (!booking.mapsUrl) {
      return;
    }

    try {
      await Linking.openURL(booking.mapsUrl);
    } catch {
      Alert.alert('Service location', 'Unable to open Maps on this device.');
    }
  }

  function openAction(booking: Booking, action: RequestAction) {
    setReason('');
    setDialogError(null);
    setActionDialog({ booking, action });
  }

  async function confirmAction() {
    if (!actionDialog || updateStatus.isPending) {
      return;
    }

    const cleanReason = reason.trim();

    if (actionDialog.action.reasonRequired && cleanReason.length < 3) {
      setDialogError('Please enter a clear reason before continuing.');
      return;
    }

    try {
      await updateStatus.mutateAsync({
        bookingId: actionDialog.booking.id,
        status: actionDialog.action.status,
        reason: cleanReason || undefined,
      });
      setActionDialog(null);
      setReason('');
      setDialogError(null);
    } catch (mutationError) {
      setDialogError(errorMessage(mutationError));
    }
  }

  if (bookingsQuery.isLoading && bookings.length === 0) {
    return <RequestsSkeleton />;
  }

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={pullRefresh.refreshing}
            onRefresh={pullRefresh.onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        {bookingsQuery.error ? (
          <AlertBanner variant="error">
            {errorMessage(bookingsQuery.error)}
          </AlertBanner>
        ) : null}

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="clock"
            label="Pending"
            value={counts.pending}
            iconColor="#B56A00"
            iconBackground="#FFF3DE"
          />
          <SummaryCard
            icon="briefcase"
            label="Active"
            value={counts.active}
            iconColor={theme.colors.info}
            iconBackground="#EAF0FF"
          />
          <SummaryCard
            icon="checkCircle"
            label="Completed"
            value={counts.completed}
            iconColor={theme.colors.success}
            iconBackground="#EAF8EF"
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.flex}>
            <AppText variant="h2">Service requests</AppText>
          </View>
        </View>

        <View style={styles.filterBar}>
          <Button
            label={`All ${filterCounts.all}`}
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onPress={() => setFilter('all')}
            style={styles.filterButton}
          />

          <View style={styles.filterScrollContainer}>
            {filtersScrolled ? (
              <View
                pointerEvents="none"
                style={[
                  styles.filterScrollDivider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={event => {
                const nextScrolled = event.nativeEvent.contentOffset.x > 4;
                if (nextScrolled !== filtersScrolled) {
                  setFiltersScrolled(nextScrolled);
                }
              }}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.filter(item => item.key !== 'all').map(item => {
                const selected = item.key === filter;

                return (
                  <Button
                    key={item.key}
                    label={`${item.label} ${filterCounts[item.key]}`}
                    variant={selected ? 'primary' : 'secondary'}
                    onPress={() => setFilter(item.key)}
                    style={styles.filterButton}
                  />
                );
              })}
            </ScrollView>
          </View>
        </View>

        {visibleBookings.length ? (
          <View style={styles.stack}>
            {visibleBookings.map(booking => (
              <ProviderRequestCard
                key={booking.id}
                booking={booking}
                onChat={() => openChat(booking)}
                onCall={() => openCall(booking)}
                onRoute={() => void openRoute(booking)}
                onDetails={() => openDetails(booking)}
                onAction={action => openAction(booking, action)}
              />
            ))}
          </View>
        ) : (
          <EmptyRequests filter={filter} onRetry={refreshAll} />
        )}
      </ScrollView>

      <RequestActionModal
        state={actionDialog}
        reason={reason}
        error={dialogError}
        saving={updateStatus.isPending}
        onChangeReason={value => {
          setReason(value);
          setDialogError(null);
        }}
        onClose={() => {
          if (!updateStatus.isPending) {
            setActionDialog(null);
            setReason('');
            setDialogError(null);
          }
        }}
        onConfirm={() => void confirmAction()}
      />
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  iconColor,
  iconBackground,
}: {
  icon: AppIconName;
  label: string;
  value: number;
  iconColor: string;
  iconBackground: string;
}): React.JSX.Element {
  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryMetricRow}>
        <View style={[styles.summaryIcon, { backgroundColor: iconBackground }]}>
          <AppIcon name={icon} size={iconSize.md} color={iconColor} />
        </View>
        <AppText variant="h2">{value}</AppText>
      </View>
      <AppText variant="caption" muted numberOfLines={1}>
        {label}
      </AppText>
    </Card>
  );
}

function ProviderRequestCard({
  booking,
  onChat,
  onCall,
  onRoute,
  onDetails,
  onAction,
}: {
  booking: Booking;
  onChat: () => void;
  onCall: () => void;
  onRoute: () => void;
  onDetails: () => void;
  onAction: (action: RequestAction) => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const price = formatPrice(booking.servicePrice);
  const location = booking.location || booking.area;
  const actions = actionsFor(booking.status);
  const communicationEnabled = booking.chatEnabled && isActive(booking.status);
  const showLocation = communicationEnabled && Boolean(location);

  return (
    <Card style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.flex}>
          <AppText variant="caption" muted style={styles.bookingCode}>
            {booking.bookingCode || `REQUEST #${booking.id}`}
          </AppText>
          <AppText variant="title" numberOfLines={2}>
            {booking.serviceName}
          </AppText>
          {booking.isCustomService ? (
            <AppText variant="caption" color={theme.colors.info} style={styles.servicePrice}>
              Custom service
            </AppText>
          ) : price ? (
            <AppText variant="caption" color={theme.colors.success} style={styles.servicePrice}>
              Starting {price}
            </AppText>
          ) : null}
        </View>

        <View style={styles.statusActions}>
          <BookingStatusBadge status={booking.status} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open request details"
            onPress={onDetails}
            style={({ pressed }) => [
              styles.detailsButton,
              {
                backgroundColor: theme.colors.surfaceMuted,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <AppIcon
              name="chevronRight"
              size={16}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.customerRow}>
        <Avatar
          source={booking.customerImage ? { uri: booking.customerImage } : undefined}
          initials={booking.customerName || 'Customer'}
          size="md"
        />
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1}>
            {booking.customerName || 'Customer'}
          </AppText>
          <AppText variant="caption" muted>
            Customer
          </AppText>
        </View>
      </View>

      <View style={[styles.detailDivider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.quickFactsRow}>
        <CompactFact icon="calendar" value={formatDate(booking.date)} />
        <CompactFact icon="clock" value={formatTime(booking.time)} />
      </View>

      {showLocation ? (
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: theme.colors.secondary }]}>
            <AppIcon name="mapPin" size={iconSize.xs} color={theme.colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodySmall" numberOfLines={2}>
              {location}
            </AppText>
            {booking.distanceLabel ? (
              <AppText variant="caption" muted style={styles.smallGap}>
                {booking.distanceLabel} from your business
              </AppText>
            ) : null}
          </View>
          {booking.mapsUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open route in Maps"
              onPress={onRoute}
              style={styles.inlineRouteAction}
            >
              <AppText variant="caption" color={theme.colors.primary}>
                Route
              </AppText>
              <AppIcon
                name="externalLink"
                size={14}
                color={theme.colors.primary}
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {booking.note ? (
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
            <AppIcon name="message" size={iconSize.xs} color={theme.colors.textMuted} />
          </View>
          <View style={styles.flex}>
            <AppText variant="caption" muted>
              Customer note
            </AppText>
            <AppText variant="bodySmall" style={styles.smallGap}>
              {booking.note}
            </AppText>
          </View>
        </View>
      ) : null}

      {booking.reason &&
      (booking.status === 'rejected' ||
        booking.status === 'not_completed' ||
        booking.status === 'cancelled') ? (
        <View style={[styles.reasonRow, { backgroundColor: '#FFF5EA' }]}>
          <AppIcon name="x" size={iconSize.xs} color={theme.colors.warning} />
          <View style={styles.flex}>
            <AppText variant="caption" color={theme.colors.warning}>
              Reason
            </AppText>
            <AppText variant="bodySmall" color={theme.colors.warning} style={styles.smallGap}>
              {booking.reason}
            </AppText>
          </View>
        </View>
      ) : null}

      {booking.status === 'completed' && booking.rating != null ? (
        <ReviewBlock booking={booking} />
      ) : null}

      {communicationEnabled ? (
        <View style={styles.secondaryActions}>
          <RequestCommunicationAction
            icon="message"
            label="Chat"
            onPress={onChat}
          />
          <RequestCommunicationAction
            icon="phone"
            label="Call"
            onPress={onCall}
          />
        </View>
      ) : null}

      {actions.length ? (
        <View
          style={[
            styles.lifecycleActions,
            { borderTopColor: theme.colors.border },
          ]}
        >
          {actions.map(action => (
            <Button
              key={action.status}
              label={action.label}
              variant={action.primary ? 'primary' : 'outline'}
              onPress={() => onAction(action)}
              style={styles.flexButton}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function RequestCommunicationAction({
  icon,
  label,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.communicationAction,
        {
          backgroundColor: pressed
            ? theme.colors.secondary
            : theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      <AppText variant="label" color={theme.colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

function CompactFact({
  icon,
  value,
}: {
  icon: AppIconName;
  value: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.compactFact}>
      <AppIcon name={icon} size={iconSize.xs} color={theme.colors.primary} />
      <AppText variant="bodySmall" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

function ReviewBlock({ booking }: { booking: Booking }): React.JSX.Element {
  const { theme } = useAppTheme();
  const rating = Math.max(0, Math.min(5, Number(booking.rating ?? 0)));

  return (
    <View style={[styles.reviewRow, { backgroundColor: '#FFF9E8' }]}>
      <View style={styles.reviewTopRow}>
        <View style={styles.ratingValue}>
          <AppIcon
            name="star"
            size={iconSize.xs}
            color={theme.colors.rating}
            fill={theme.colors.rating}
          />
          <AppText variant="label">{rating.toFixed(1)}</AppText>
          <AppText variant="caption" muted>
            Customer review
          </AppText>
        </View>

        <View style={styles.starsRow}>
          {[0, 1, 2, 3, 4].map(index => {
            const active = index < Math.round(rating);
            return (
              <AppIcon
                key={index}
                name="star"
                size={14}
                color={active ? theme.colors.rating : theme.colors.border}
                fill={active ? theme.colors.rating : 'none'}
              />
            );
          })}
        </View>
      </View>

      {booking.reviewComment ? (
        <AppText variant="bodySmall">{booking.reviewComment}</AppText>
      ) : null}
    </View>
  );
}

function RequestActionModal({
  state,
  reason,
  error,
  saving,
  onChangeReason,
  onClose,
  onConfirm,
}: {
  state: ActionDialogState | null;
  reason: string;
  error: string | null;
  saving: boolean;
  onChangeReason: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const visible = Boolean(state);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          {state ? (
            <View
              style={[
                styles.actionSheet,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.actionHeading}>
                <View style={styles.flex}>
                  <AppText variant="caption" color={theme.colors.primary}>
                    {state.booking.bookingCode}
                  </AppText>
                  <AppText variant="h2" style={styles.smallGap}>
                    {state.action.confirmLabel}?
                  </AppText>
                  <AppText variant="bodySmall" muted style={styles.smallGap}>
                    {state.booking.serviceName} for{' '}
                    {state.booking.customerName || 'customer'}
                  </AppText>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  disabled={saving}
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <AppIcon name="x" size={iconSize.sm} color={theme.colors.text} />
                </Pressable>
              </View>

              {state.action.reasonRequired ? (
                <Input
                  label="Reason"
                  value={reason}
                  onChangeText={onChangeReason}
                  placeholder="Write a clear reason for the customer"
                  maxLength={500}
                  multiline
                  textAlignVertical="top"
                  editable={!saving}
                  style={styles.reasonInput}
                  error={error || undefined}
                />
              ) : error ? (
                <AlertBanner variant="error">{error}</AlertBanner>
              ) : null}

              <View
                style={[
                  styles.actionNotice,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <AppText variant="caption" muted>
                  The customer will see this updated booking status.
                </AppText>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  label="Go back"
                  variant="outline"
                  disabled={saving}
                  onPress={onClose}
                  style={styles.flexButton}
                />
                <Button
                  label="Confirm"
                  loading={saving}
                  disabled={
                    state.action.reasonRequired && reason.trim().length < 3
                  }
                  onPress={onConfirm}
                  style={styles.flexButton}
                />
              </View>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EmptyRequests({
  filter,
  onRetry,
}: {
  filter: RequestFilter;
  onRetry: () => Promise<unknown>;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const selected = FILTERS.find(item => item.key === filter)?.label ?? 'requests';

  return (
    <Card style={styles.emptyCard}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.secondary }]}>
        <AppIcon name="calendar" size={iconSize.lg} color={theme.colors.primary} />
      </View>
      <AppText variant="title">
        {filter === 'all'
          ? 'No service requests yet'
          : `No ${selected.toLowerCase()} requests`}
      </AppText>
      <AppText variant="bodySmall" muted style={styles.emptyCopy}>
        {filter === 'all'
          ? 'New customer requests will appear here.'
          : 'Choose another status or refresh to check for updates.'}
      </AppText>
      <Button label="Refresh" variant="outline" onPress={() => void onRetry()} />
    </Card>
  );
}

function RequestsSkeleton(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryGrid}>
        {[0, 1, 2].map(index => (
          <Skeleton
            key={index}
            width="31.5%"
            height={94}
            radiusValue={PROVIDER_SURFACE_RADIUS}
          />
        ))}
      </View>
      <Skeleton width="52%" height={28} radiusValue={10} />
      <Skeleton height={48} radiusValue={radius.pill} />
      <Skeleton height={320} radiusValue={PROVIDER_SURFACE_RADIUS} />
      <Skeleton height={260} radiusValue={PROVIDER_SURFACE_RADIUS} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  flexButton: {
    flex: 1,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 94,
    borderRadius: 22,
    padding: spacing[3],
    justifyContent: 'space-between',
  },
  summaryMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minWidth: 0,
  },
  filterScrollContainer: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  filterScrollDivider: {
    position: 'absolute',
    left: -5,
    top: 7,
    bottom: 7,
    width: StyleSheet.hairlineWidth,
    zIndex: 3,
  },
  filterRow: {
    gap: spacing[2],
    paddingRight: layout.screenHorizontal,
  },
  filterButton: {
    minHeight: 40,
    paddingHorizontal: spacing[4],
    borderRadius: radius.pill,
  },
  stack: {
    gap: spacing[3],
  },
  requestCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
    gap: spacing[3],
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  statusActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailsButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCode: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
  },
  servicePrice: {
    marginTop: spacing[1],
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
  },
  quickFactsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  compactFact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minWidth: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inlineRouteAction: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    alignSelf: 'center',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  reviewRow: {
    borderRadius: radius.md,
    padding: spacing[3],
    gap: spacing[2],
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  communicationAction: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  lifecycleActions: {
    paddingTop: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[2],
  },
  emptyCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    textAlign: 'center',
    maxWidth: 260,
  },
  modalRoot: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 20, 28, 0.50)',
  },
  actionSheet: {
    marginHorizontal: FLOATING_SHEET_MARGIN,
    marginBottom: FLOATING_SHEET_MARGIN,
    borderWidth: 1,
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
    gap: spacing[4],
    maxHeight: '82%',
  },
  actionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonInput: {
    minHeight: 96,
    paddingTop: spacing[3],
  },
  actionNotice: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});
