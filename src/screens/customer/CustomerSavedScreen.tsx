import React from 'react';

import {WorkspacePlaceholderScreen} from '../shared/WorkspacePlaceholderScreen';

export function CustomerSavedScreen(): React.JSX.Element {
  return (
    <WorkspacePlaceholderScreen
      eyebrow="CUSTOMER"
      title="Saved"
      description="Saved providers will use this workspace route."
    />
  );
}
