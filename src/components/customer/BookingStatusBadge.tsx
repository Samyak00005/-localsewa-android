import React from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '../../theme';
import { BookingStatus } from '../../types/booking';
import { AppText } from '../ui';

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

export function bookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Canceled';
    case 'rejected':
      return 'Rejected';
    case 'not_completed':
      return 'Not completed';
  }
}

function palette(status: BookingStatus): {
  background: string;
  text: string;
} {
  switch (status) {
    case 'pending':
      return {
        background: '#FFF5D6',
        text: '#9A6700',
      };

    case 'accepted':
      return {
        background: '#E2ECFF',
        text: '#2457C5',
      };

    case 'in_progress':
      return {
        background: '#DFF7EA',
        text: '#087443',
      };

    case 'completed':
      return {
        background: '#DCFCE7',
        text: '#15803D',
      };

    case 'cancelled':
      return {
        background: '#EEF2F4',
        text: '#53646B',
      };

    case 'rejected':
      return {
        background: '#FEE8E7',
        text: '#B42318',
      };

    case 'not_completed':
      return {
        background: '#FFF0E1',
        text: '#B45309',
      };
  }
}

export function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps): React.JSX.Element {
  const colors = palette(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <AppText variant="overline" color={colors.text} style={styles.label}>
        {bookingStatusLabel(status)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  label: {
    letterSpacing: 0.2,
    textTransform: 'none',
  },
});
