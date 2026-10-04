import React from 'react';

import {WorkspacePlaceholderScreen} from '../shared/WorkspacePlaceholderScreen';

export function CustomerServicesScreen(): React.JSX.Element {
  return (
    <WorkspacePlaceholderScreen
      eyebrow="CUSTOMER"
      title="Services"
      description="Service discovery and search will be built on this route."
    />
  );
}
