import React from 'react';

import {useAppShell} from '../../app/AppShellProvider';
import {WorkspacePlaceholderScreen} from '../shared/WorkspacePlaceholderScreen';

export function ProviderReviewsScreen(): React.JSX.Element {
  const {providerTier} = useAppShell();

  return (
    <WorkspacePlaceholderScreen
      eyebrow="PROVIDER"
      title="Reviews"
      description="Provider ratings and reviews will be built here."
      premiumBadge={providerTier === 'LOCALSEWA_PLUS'}
    />
  );
}
