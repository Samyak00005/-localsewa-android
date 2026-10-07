import React from 'react';

import { useAppShell } from '../../app/AppShellProvider';
import { WorkspacePlaceholderScreen } from '../shared/WorkspacePlaceholderScreen';

export function ProviderRequestsScreen(): React.JSX.Element {
  const { providerTier, providerPremiumVisuals } = useAppShell();

  return (
    <WorkspacePlaceholderScreen
      eyebrow="PROVIDER"
      title="Requests"
      description="Service requests and booking jobs will use this route."
      premiumBadge={providerTier === 'LOCALSEWA_PLUS'}
      premiumBadgeAccent={providerPremiumVisuals}
    />
  );
}
