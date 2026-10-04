import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {Booking} from '../../types/booking';
import {
  spacing,
  useAppTheme,
} from '../../theme';
import {
  AppText,
  Avatar,
  Card,
} from '../ui';
import {
  BookingStatusBadge,
} from './BookingStatusBadge';

type BookingCardProps = {
  booking: Booking;
  onPress: () => void;
};

function price(
  value: number | null,
): string | null {
  if (value == null) {
    return null;
  }

  return `₹${Math.round(
    value,
  ).toLocaleString('en-IN')}`;
}

function displayTime(
  value: string,
): string {
  return value
    ? value.slice(0, 5)
    : '';
}

export function BookingCard({
  booking,
  onPress,
}: BookingCardProps): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}>
      {({pressed}) => (
        <Card
          style={{
            opacity:
              pressed ? 0.92 : 1,
          }}>
          <View style={styles.topRow}>
            <View style={styles.providerRow}>
              {booking.providerImage ? (
                <Image
                  source={{
                    uri:
                      booking.providerImage,
                  }}
                  style={styles.image}
                />
              ) : (
                <Avatar
                  initials={
                    booking.providerName
                  }
                  size="md"
                />
              )}

              <View style={styles.providerCopy}>
                <AppText
                  variant="title"
                  numberOfLines={1}>
                  {booking.serviceName}
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  numberOfLines={1}>
                  {booking.providerName}
                </AppText>
              </View>
            </View>

            <BookingStatusBadge
              status={booking.status}
            />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <AppText
                variant="caption"
                muted>
                Booking
              </AppText>
              <AppText variant="label">
                {booking.bookingCode}
              </AppText>
            </View>

            <View style={styles.metaItem}>
              <AppText
                variant="caption"
                muted>
                Schedule
              </AppText>
              <AppText variant="label">
                {booking.date}
                {' · '}
                {displayTime(
                  booking.time,
                )}
              </AppText>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.location}>
              <AppText
                variant="caption"
                muted
                numberOfLines={1}>
                {booking.area ||
                  booking.location ||
                  'Location hidden'}
              </AppText>
            </View>

            {price(
              booking.servicePrice,
            ) ? (
              <View style={styles.price}>
                <AppText
                  variant="caption"
                  muted>
                  Service price
                </AppText>

                <AppText
                  variant="label"
                  color={
                    theme.colors.primary
                  }>
                  {price(
                    booking.servicePrice,
                  )}
                </AppText>
              </View>
            ) : null}
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
    gap: spacing[3],
  },
  providerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  providerCopy: {
    flex: 1,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[5],
    marginTop: spacing[4],
  },
  metaItem: {
    flex: 1,
    gap: spacing[1],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  location: {
    flex: 1,
  },
  price: {
    alignItems: 'flex-end',
  },
});
