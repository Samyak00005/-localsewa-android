import React from 'react';

import {WorkspacePlaceholderScreen} from '../shared/WorkspacePlaceholderScreen';

export function CustomerHomeScreen(): React.JSX.Element {
  return (
    <WorkspacePlaceholderScreen
      eyebrow="CUSTOMER"
      title="Home"
      description="Customer home workspace navigation is ready."
    />
  );
}
