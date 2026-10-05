import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { shadows, spacing, useAppTheme } from '../../theme';
import { Booking, BookingStatus } from '../../types/booking';
import { AppIcon, AppIconName, iconSize } from '../icons';
import { AppText } from '../ui';
import { BookingStatusBadge } from './BookingStatusBadge';
import { InlineBookingReview } from './InlineBookingReview';

type BookingCardProps = {
  booking: Booking;
  onPress: () => void;
  onChat?: () => void;
  onCall?: () => void;
  onCancel?: () => void;
  onRebook?: () => void;
  onOpenLocation?: () => void;
  cancelLoading?: boolean;
};

function price(value: number | null): string | null {
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
    return '';
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

function isClosed(status: BookingStatus): boolean {
  return (
    status === 'cancelled' ||
    status === 'rejected' ||
    status === 'not_completed'
  );
}

function isActive(status: BookingStatus): boolean {
  return (
    status === 'pending' || status === 'accepted' || status === 'in_progress'
  );
}

export function BookingCard({
  booking,
  onPress,
  onChat,
  onCall,
  onCancel,
  onRebook,
  onOpenLocation,
  cancelLoading = false,
}: BookingCardProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const servicePrice = price(booking.servicePrice);

  const active = isActive(booking.status);

  const closed = isClosed(booking.status);

  const completed = booking.status === 'completed';

  const location = booking.location || booking.area;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        shadows.sm,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open booking ${booking.bookingCode}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.detailsArea,
          {
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <View style={styles.topRow}>
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
                  styles.fallbackIcon,
                  {
                    backgroundColor: '#E8FAF0',
                  },
                ]}
              >
                <AppIcon
                  name="calendar"
                  size={iconSize.sm}
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
                numberOfLines={1}
                style={styles.serviceName}
              >
                {booking.serviceName}
              </AppText>

              {booking.isCustomService ? (
                <AppText
                  variant="overline"
                  color="#6941C6"
                  style={styles.customLabel}
                >
                  Custom service request
                </AppText>
              ) : null}
            </View>
          </View>

          <BookingStatusBadge status={booking.status} />
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.scheduleRow}>
            <Meta icon="calendar" value={formatDate(booking.date)} />

            <Meta icon="clock" value={formatTime(booking.time)} />
          </View>

          <View style={styles.bookingCodeRow}>
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              numberOfLines={1}
            >
              Booking {booking.bookingCode}
            </AppText>

            {servicePrice ? (
              <View
                style={[
                  styles.priceChip,
                  {
                    backgroundColor: '#F0FBF5',
                  },
                ]}
              >
                <AppText variant="caption" color="#087443">
                  {servicePrice}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        {active ? (
          <ActiveContent
            booking={booking}
            location={location}
            onOpenLocation={onOpenLocation}
          />
        ) : null}

        {closed ? (
          <ClosedContent booking={booking} location={location} />
        ) : null}

        {completed && booking.note ? (
          <View style={styles.stateSection}>
            <CompactNote label="Your note" value={booking.note} />
          </View>
        ) : null}
      </Pressable>

      {completed ? (
        <View style={styles.inlineReviewOuter}>
          <InlineBookingReview
            bookingId={booking.id}
            canRate={booking.canRate}
            rating={booking.rating}
            reviewComment={booking.reviewComment}
            compact
          />
        </View>
      ) : null}

      {(active &&
        ((booking.chatEnabled && (onChat || onCall)) ||
          (booking.canCancel && onCancel))) ||
      ((closed || completed) && booking.canRebook && onRebook) ? (
        <View
          style={[
            styles.actions,
            {
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          {active ? (
            <>
              {booking.chatEnabled && onChat ? (
                <BookingAction
                  icon="message"
                  label="In-app chat"
                  variant="primary"
                  onPress={onChat}
                />
              ) : null}

              {booking.chatEnabled && onCall ? (
                <BookingAction
                  icon="phone"
                  label="Call"
                  variant="outline"
                  onPress={onCall}
                />
              ) : null}

              {booking.canCancel && onCancel ? (
                <BookingAction
                  label="Cancel booking"
                  variant="dangerOutline"
                  loading={cancelLoading}
                  fullWidth
                  onPress={onCancel}
                />
              ) : null}
            </>
          ) : null}

          {(closed || completed) && booking.canRebook && onRebook ? (
            <BookingAction
              label="Book again"
              variant="primary"
              fullWidth
              onPress={onRebook}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function ActiveContent({
  booking,
  location,
  onOpenLocation,
}: {
  booking: Booking;
  location: string | null;
  onOpenLocation?: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.stateSection}>
      {location ? (
        <View style={styles.locationBlock}>
          <View style={styles.locationTextRow}>
            <AppIcon name="mapPin" size={14} color={theme.colors.primary} />

            <AppText
              variant="bodySmall"
              color={theme.colors.textSecondary}
              style={styles.locationText}
              numberOfLines={2}
            >
              {location}
            </AppText>
          </View>

          {booking.mapsUrl && onOpenLocation ? (
            <Pressable
              accessibilityRole="button"
              onPress={onOpenLocation}
              style={({ pressed }) => [
                styles.locationLink,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <AppIcon name="mapPin" size={14} color={theme.colors.primary} />

              <AppText variant="label" color={theme.colors.primary}>
                Open service address
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {booking.providerLocation ? (
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.providerBase}
          numberOfLines={1}
        >
          Provider based in {booking.providerLocation}
        </AppText>
      ) : null}

      {booking.status === 'pending' ? (
        <StateNotice
          title="Waiting for provider response"
          color="#8A6500"
          background="#FFF9E8"
          border="#F5DF9F"
        />
      ) : null}

      {booking.status === 'in_progress' ? (
        <StateNotice
          title="Service is currently underway"
          color="#087443"
          background="#ECFAF1"
          border="#C8EBD6"
          live
        />
      ) : null}
    </View>
  );
}

function ClosedContent({
  booking,
  location,
}: {
  booking: Booking;
  location: string | null;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.stateSection}>
      <View style={styles.closedLocationRow}>
        <AppIcon name="mapPin" size={13} color={theme.colors.textMuted} />

        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.locationText}
          numberOfLines={2}
        >
          {location ? location : 'Location hidden for this booking state'}
        </AppText>
      </View>

      {booking.note ? (
        <CompactNote label="Your note" value={booking.note} />
      ) : null}

      {booking.status === 'rejected' && booking.reason ? (
        <ReasonBox
          title="Provider reason"
          value={booking.reason}
          background="#FFF4F3"
          border="#F5D0CC"
          color="#B42318"
        />
      ) : null}

      {booking.status === 'not_completed' && booking.reason ? (
        <ReasonBox
          title="Not completed"
          value={booking.reason}
          background="#FFF7ED"
          border="#F3D8B4"
          color="#B45309"
        />
      ) : null}

      {booking.status === 'cancelled' && booking.reason ? (
        <ReasonBox
          title="Booking canceled"
          value={booking.reason}
          background="#F6F8FA"
          border="#DDE3E7"
          color="#53646B"
        />
      ) : null}
    </View>
  );
}

function Meta({
  icon,
  value,
}: {
  icon: 'calendar' | 'clock';
  value: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.meta}>
      <AppIcon name={icon} size={13} color={theme.colors.primary} />

      <AppText variant="caption" numberOfLines={1} style={styles.metaValue}>
        {value}
      </AppText>
    </View>
  );
}

function CompactNote({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.compactNote,
        {
          backgroundColor: theme.colors.surfaceMuted,
        },
      ]}
    >
      <AppText variant="label">{label}</AppText>

      <AppText
        variant="bodySmall"
        color={theme.colors.textSecondary}
        numberOfLines={2}
        style={styles.compactNoteText}
      >
        {value}
      </AppText>
    </View>
  );
}

function StateNotice({
  title,
  color,
  background,
  border,
  live = false,
}: {
  title: string;
  color: string;
  background: string;
  border: string;
  live?: boolean;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.stateNotice,
        {
          backgroundColor: background,
          borderColor: border,
        },
      ]}
    >
      {live ? <View style={styles.liveDot} /> : null}

      <AppText variant="caption" color={color} style={styles.stateNoticeText}>
        {title}
      </AppText>
    </View>
  );
}

function ReasonBox({
  title,
  value,
  background,
  border,
  color,
}: {
  title: string;
  value: string;
  background: string;
  border: string;
  color: string;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.reasonBox,
        {
          backgroundColor: background,
          borderColor: border,
        },
      ]}
    >
      <AppText variant="label" color={color}>
        {title}
      </AppText>

      <AppText
        variant="bodySmall"
        color={color}
        numberOfLines={2}
        style={styles.reasonText}
      >
        {value}
      </AppText>
    </View>
  );
}

type ActionVariant = 'primary' | 'outline' | 'dangerOutline';

function BookingAction({
  icon,
  label,
  variant,
  fullWidth = false,
  loading = false,
  onPress,
}: {
  icon?: AppIconName;
  label: string;
  variant: ActionVariant;
  fullWidth?: boolean;
  loading?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const primary = variant === 'primary';

  const danger = variant === 'dangerOutline';

  const background = primary ? '#118B4B' : '#FFFFFF';

  const border = danger ? '#F3B9B5' : primary ? '#118B4B' : '#88D9AA';

  const color = danger ? '#D92D20' : primary ? '#FFFFFF' : '#087443';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        busy: loading,
      }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        fullWidth && styles.fullAction,
        {
          backgroundColor: background,
          borderColor: border,
          opacity: loading ? 0.55 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          {icon ? <AppIcon name={icon} size={15} color={color} /> : null}

          <AppText variant="label" color={color}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  detailsArea: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 13,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  identityRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  providerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  fallbackIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    marginTop: 1,
  },
  customLabel: {
    marginTop: 3,
    letterSpacing: 0.25,
    fontSize: 9.5,
  },
  metaBlock: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#E7ECE9',
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaValue: {
    flexShrink: 1,
  },
  bookingCodeRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  priceChip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
  },
  stateSection: {
    marginTop: 12,
  },
  locationBlock: {
    gap: 8,
  },
  locationTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  locationText: {
    flex: 1,
  },
  locationLink: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FCF5',
  },
  providerBase: {
    marginTop: 9,
  },
  stateNotice: {
    marginTop: 10,
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stateNoticeText: {
    flex: 1,
    fontWeight: '600',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#24C56A',
  },
  closedLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  inlineReviewOuter: {
    paddingHorizontal: 12,
    paddingBottom: 11,
  },
  compactNote: {
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  compactNoteText: {
    marginTop: 3,
  },
  reasonBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  reasonText: {
    marginTop: 3,
  },
  actions: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 118,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fullAction: {
    flexBasis: '100%',
  },
});
