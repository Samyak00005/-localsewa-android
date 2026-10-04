import React from 'react';

import {
  Badge,
} from '../ui';
import {BookingStatus} from '../../types/booking';

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

export function bookingStatusLabel(
  status: BookingStatus,
): string {
  switch (status) {
    case 'in_progress':
      return 'IN PROGRESS';
    case 'not_completed':
      return 'NOT COMPLETED';
    default:
      return status
        .replace(/_/g, ' ')
        .toUpperCase();
  }
}

export function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps): React.JSX.Element {
  const variant =
    status === 'completed'
      ? 'success'
      : status === 'cancelled' ||
          status === 'rejected' ||
          status === 'not_completed'
        ? 'error'
        : status === 'accepted' ||
            status === 'in_progress'
          ? 'info'
          : 'warning';

  return (
    <Badge variant={variant}>
      {bookingStatusLabel(status)}
    </Badge>
  );
}
