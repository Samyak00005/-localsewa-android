import React from 'react';

import { useAppShell } from '../../app/AppShellProvider';
import { WorkspacePlaceholderScreen } from '../shared/WorkspacePlaceholderScreen';

export function ProviderHomeScreen(): React.JSX.Element {
  const { providerTier, providerPremiumVisuals } = useAppShell();

  return (
    <WorkspacePlaceholderScreen
      eyebrow="PROVIDER"
      title="Dashboard"
      description="Provider dashboard will use this route in the next major Provider milestone."
      premiumBadge={providerTier === 'LOCALSEWA_PLUS'}
      premiumBadgeAccent={providerPremiumVisuals}
    />
  );
}
