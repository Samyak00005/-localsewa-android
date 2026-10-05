import React from 'react';

import { useAppShell } from '../../app/AppShellProvider';
import { WorkspacePlaceholderScreen } from '../shared/WorkspacePlaceholderScreen';

export function ProviderHomeScreen(): React.JSX.Element {
  const { providerTier } = useAppShell();

  return (
    <WorkspacePlaceholderScreen
      eyebrow="PROVIDER"
      title="Home"
      description="Provider dashboard will be designed on this route."
      premiumBadge={providerTier === 'LOCALSEWA_PLUS'}
    />
  );
}
