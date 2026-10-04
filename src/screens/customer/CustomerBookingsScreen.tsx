import React from 'react';

import {WorkspacePlaceholderScreen} from '../shared/WorkspacePlaceholderScreen';

export function CustomerBookingsScreen(): React.JSX.Element {
  return (
    <WorkspacePlaceholderScreen
      eyebrow="CUSTOMER"
      title="Bookings"
      description="Customer booking lists and booking details will live here."
    />
  );
}
