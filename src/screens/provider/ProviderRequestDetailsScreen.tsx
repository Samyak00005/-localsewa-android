import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '../../api/apiClient';
import { BookingStatusBadge } from '../../components/customer/BookingStatusBadge';
import { AppIcon, AppIconName, iconSize } from '../../components/icons';
import { ProviderHeader } from '../../components/provider';
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
} from '../../hooks/useProviderWorkspace';
import { ProviderStackParamList } from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { Booking, BookingStatus } from '../../types/booking';

type Props = NativeStackScreenProps<
  ProviderStackParamList,
  'ProviderRequestDetails'
>;

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
  action: RequestAction;
};

const CARD_RADIUS = 28;
const FLOATING_SHEET_MARGIN = 12;

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

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value || 'Date unavailable';
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

  return `${Number(match[3])} ${months[Number(match[2]) - 1]} ${match[1]}`;
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

export function ProviderRequestDetailsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bookingsQuery = useProviderBookings();
  const updateStatus = useProviderBookingStatusUpdate();
  const [actionDialog, setActionDialog] = useState<ActionDialogState | null>(
    null,
  );
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const booking = useMemo(
    () =>
      (bookingsQuery.data ?? []).find(
        item => item.id === route.params.bookingId,
      ),
    [bookingsQuery.data, route.params.bookingId],
  );

  const pullRefresh = useManualRefresh(async () => {
    await bookingsQuery.refetch();
  });

  const actions = booking ? actionsFor(booking.status) : [];
  const hasStickyActions = actions.length > 0;

  async function openRoute() {
    if (!booking?.mapsUrl) {
      return;
    }

    try {
      await Linking.openURL(booking.mapsUrl);
    } catch {
      setActionError('Unable to open Maps on this device.');
    }
  }

  function openAction(action: RequestAction) {
    setReason('');
    setActionError(null);
    setActionDialog({ action });
  }

  async function confirmAction() {
    if (!booking || !actionDialog || updateStatus.isPending) {
      return;
    }

    const cleanReason = reason.trim();

    if (actionDialog.action.reasonRequired && cleanReason.length < 3) {
      setActionError('Please enter a clear reason before continuing.');
      return;
    }

    try {
      await updateStatus.mutateAsync({
        bookingId: booking.id,
        status: actionDialog.action.status,
        reason: cleanReason || undefined,
      });
      setActionDialog(null);
      setReason('');
      setActionError(null);
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}> 
      <ProviderHeader />

      <View
        style={[
          styles.detailHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to requests"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.colors.surfaceMuted,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <AppIcon
            name="chevronLeft"
            size={iconSize.sm}
            color={theme.colors.primary}
          />
        </Pressable>

        <View style={styles.flex}>
          <AppText variant="title">Request details</AppText>
          <AppText variant="caption" muted numberOfLines={1}>
            {booking?.bookingCode || 'Provider service request'}
          </AppText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: hasStickyActions
              ? 116 + Math.max(insets.bottom, 8)
              : spacing[10] + Math.max(insets.bottom, 8),
          },
        ]}
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
        {bookingsQuery.isLoading && !booking ? (
          <DetailsSkeleton />
        ) : bookingsQuery.error || !booking ? (
          <View style={styles.errorWrap}>
            <AlertBanner variant="error">
              {errorMessage(
                bookingsQuery.error ?? new Error('Request could not be loaded.'),
              )}
            </AlertBanner>
            <Button
              label="Retry"
              variant="outline"
              loading={bookingsQuery.isRefetching}
              onPress={() => bookingsQuery.refetch()}
              fullWidth
            />
          </View>
        ) : (
          <>
            {actionError && !actionDialog ? (
              <AlertBanner variant="error">{actionError}</AlertBanner>
            ) : null}

            <RequestIdentityCard booking={booking} />
            <CustomerCard booking={booking} />
            <ScheduleCard booking={booking} />

            {booking.location || booking.area ? (
              <LocationCard booking={booking} onRoute={() => void openRoute()} />
            ) : null}

            {booking.chatEnabled ? (
              <CommunicationCard
                onChat={() =>
                  navigation.navigate('ProviderBookingChat', {
                    bookingId: booking.id,
                  })
                }
                onCall={() =>
                  navigation.navigate('ProviderVoiceCallPreview', {
                    bookingId: booking.id,
                  })
                }
              />
            ) : null}

            {booking.note ? (
              <InfoCard
                icon="message"
                title="Customer note"
                body={booking.note}
              />
            ) : null}

            {booking.reason ? (
              <InfoCard
                icon="x"
                title={
                  booking.status === 'not_completed'
                    ? 'Not completed reason'
                    : booking.status === 'cancelled'
                    ? 'Cancellation reason'
                    : 'Rejection reason'
                }
                body={booking.reason}
                tone="warning"
              />
            ) : null}

            {booking.status === 'completed' && booking.rating != null ? (
              <ReviewCard booking={booking} />
            ) : null}
          </>
        )}
      </ScrollView>

      {booking && hasStickyActions ? (
        <View
          style={[
            styles.stickyActions,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              paddingBottom: Math.max(insets.bottom, spacing[2]),
            },
          ]}
        >
          {actions.map(action => (
            <Button
              key={action.status}
              label={action.label}
              variant={action.primary ? 'primary' : 'outline'}
              onPress={() => openAction(action)}
              style={styles.flexButton}
            />
          ))}
        </View>
      ) : null}

      <RequestActionModal
        booking={booking ?? null}
        state={actionDialog}
        reason={reason}
        error={actionDialog ? actionError : null}
        saving={updateStatus.isPending}
        onChangeReason={value => {
          setReason(value);
          setActionError(null);
        }}
        onClose={() => {
          if (!updateStatus.isPending) {
            setActionDialog(null);
            setReason('');
            setActionError(null);
          }
        }}
        onConfirm={() => void confirmAction()}
      />
    </View>
  );
}

function RequestIdentityCard({ booking }: { booking: Booking }): React.JSX.Element {
  const { theme } = useAppTheme();
  const price = formatPrice(booking.servicePrice);

  return (
    <Card style={styles.majorCard}>
      <View style={styles.identityTopRow}>
        <View style={styles.flex}>
          <AppText variant="caption" muted style={styles.bookingCode}>
            {booking.bookingCode || `REQUEST #${booking.id}`}
          </AppText>
          <AppText variant="h2" numberOfLines={2}>
            {booking.serviceName}
          </AppText>
          {booking.isCustomService ? (
            <AppText variant="caption" color={theme.colors.info} style={styles.smallGap}>
              Custom service
            </AppText>
          ) : price ? (
            <AppText variant="caption" color={theme.colors.success} style={styles.smallGap}>
              Starting {price}
            </AppText>
          ) : null}
        </View>
        <BookingStatusBadge status={booking.status} />
      </View>
    </Card>
  );
}

function CustomerCard({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <Card style={styles.compactCard}>
      <View style={styles.customerRow}>
        <Avatar
          source={booking.customerImage ? { uri: booking.customerImage } : undefined}
          initials={booking.customerName || 'Customer'}
          size="lg"
        />
        <View style={styles.flex}>
          <AppText variant="caption" muted>
            CUSTOMER
          </AppText>
          <AppText variant="title" numberOfLines={1}>
            {booking.customerName || 'Customer'}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

function ScheduleCard({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <Card style={styles.compactCard}>
      <View style={styles.twoColumnRow}>
        <DetailMetric icon="calendar" label="Date" value={formatDate(booking.date)} />
        <View style={styles.metricDivider} />
        <DetailMetric icon="clock" label="Time" value={formatTime(booking.time)} />
      </View>
    </Card>
  );
}

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: AppIconName;
  label: string;
  value: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: theme.colors.secondary }]}>
        <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="caption" muted>
          {label}
        </AppText>
        <AppText variant="label" style={styles.smallGap} numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

function LocationCard({
  booking,
  onRoute,
}: {
  booking: Booking;
  onRoute: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const location = booking.location || booking.area;

  return (
    <Card style={styles.majorCard}>
      <View style={styles.cardHeadingRow}>
        <View style={[styles.headingIcon, { backgroundColor: theme.colors.secondary }]}>
          <AppIcon name="mapPin" size={iconSize.sm} color={theme.colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="title">Service location</AppText>
          {booking.distanceLabel ? (
            <AppText variant="caption" muted style={styles.smallGap}>
              {booking.distanceLabel} from your business
            </AppText>
          ) : null}
        </View>
      </View>

      <AppText variant="bodySmall" style={styles.locationText}>
        {location}
      </AppText>

      {booking.mapsUrl ? (
        <Button
          label="Open route in Maps"
          icon="externalLink"
          variant="outline"
          onPress={onRoute}
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
  const { theme } = useAppTheme();

  return (
    <Card style={styles.compactCard}>
      <View style={styles.communicationHeading}>
        <AppText variant="title">Communication</AppText>
        <AppText variant="caption" muted>
          Private to this active booking
        </AppText>
      </View>
      <View style={styles.communicationActions}>
        <CommunicationAction icon="message" label="Chat" onPress={onChat} />
        <CommunicationAction icon="phone" label="Call" onPress={onCall} />
      </View>
    </Card>
  );
}

function CommunicationAction({
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

function InfoCard({
  icon,
  title,
  body,
  tone = 'default',
}: {
  icon: AppIconName;
  title: string;
  body: string;
  tone?: 'default' | 'warning';
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const warning = tone === 'warning';

  return (
    <Card
      style={[
        styles.compactCard,
        warning && {
          backgroundColor: '#FFF8EE',
          borderColor: '#F2D9B8',
        },
      ]}
    >
      <View style={styles.infoRow}>
        <View
          style={[
            styles.headingIcon,
            {
              backgroundColor: warning ? '#FFF0DC' : theme.colors.surfaceMuted,
            },
          ]}
        >
          <AppIcon
            name={icon}
            size={iconSize.sm}
            color={warning ? theme.colors.warning : theme.colors.primary}
          />
        </View>
        <View style={styles.flex}>
          <AppText
            variant="label"
            color={warning ? theme.colors.warning : theme.colors.text}
          >
            {title}
          </AppText>
          <AppText variant="bodySmall" style={styles.smallGap}>
            {body}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

function ReviewCard({ booking }: { booking: Booking }): React.JSX.Element {
  const { theme } = useAppTheme();
  const rating = Math.max(0, Math.min(5, Number(booking.rating ?? 0)));

  return (
    <Card style={[styles.majorCard, { backgroundColor: '#FFF9E8' }]}>
      <View style={styles.reviewHeading}>
        <View>
          <AppText variant="caption" muted>
            CUSTOMER REVIEW
          </AppText>
          <View style={styles.ratingLine}>
            <AppIcon
              name="star"
              size={iconSize.sm}
              color={theme.colors.rating}
              fill={theme.colors.rating}
            />
            <AppText variant="h2">{rating.toFixed(1)}</AppText>
          </View>
        </View>
        <View style={styles.starsRow}>
          {[0, 1, 2, 3, 4].map(index => {
            const active = index < Math.round(rating);
            return (
              <AppIcon
                key={index}
                name="star"
                size={16}
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
    </Card>
  );
}

function RequestActionModal({
  booking,
  state,
  reason,
  error,
  saving,
  onChangeReason,
  onClose,
  onConfirm,
}: {
  booking: Booking | null;
  state: ActionDialogState | null;
  reason: string;
  error: string | null;
  saving: boolean;
  onChangeReason: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={Boolean(state && booking)}
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
          {state && booking ? (
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
                    {booking.bookingCode}
                  </AppText>
                  <AppText variant="h2" style={styles.smallGap}>
                    {state.action.confirmLabel}?
                  </AppText>
                  <AppText variant="bodySmall" muted style={styles.smallGap}>
                    {booking.serviceName} for {booking.customerName || 'customer'}
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

function DetailsSkeleton(): React.JSX.Element {
  return (
    <View style={styles.skeletonStack}>
      <Skeleton height={128} radiusValue={CARD_RADIUS} />
      <Skeleton height={88} radiusValue={CARD_RADIUS} />
      <Skeleton height={94} radiusValue={CARD_RADIUS} />
      <Skeleton height={150} radiusValue={CARD_RADIUS} />
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
    paddingTop: spacing[4],
    gap: spacing[3],
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
  detailHeader: {
    minHeight: 66,
    paddingHorizontal: layout.screenHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  majorCard: {
    borderRadius: CARD_RADIUS,
    padding: spacing[4],
    gap: spacing[3],
  },
  compactCard: {
    borderRadius: CARD_RADIUS,
    padding: spacing[4],
  },
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  bookingCode: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minWidth: 0,
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: spacing[3],
    backgroundColor: '#D7E3DF',
  },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headingIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationText: {
    lineHeight: 20,
  },
  communicationHeading: {
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  communicationActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  communicationAction: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  reviewHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  ratingLine: {
    marginTop: spacing[1],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stickyActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[3],
    flexDirection: 'row',
    gap: spacing[2],
  },
  errorWrap: {
    gap: spacing[3],
  },
  skeletonStack: {
    gap: spacing[3],
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
    borderRadius: CARD_RADIUS,
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
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});
