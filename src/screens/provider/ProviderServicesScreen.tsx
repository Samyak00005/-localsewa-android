import React from 'react';

import { useAppShell } from '../../app/AppShellProvider';
import { WorkspacePlaceholderScreen } from '../shared/WorkspacePlaceholderScreen';

export function ProviderServicesScreen(): React.JSX.Element {
  const { providerTier } = useAppShell();

  return (
    <WorkspacePlaceholderScreen
      eyebrow="PROVIDER"
      title="Services"
      description="Provider service management will use this route."
      premiumBadge={providerTier === 'LOCALSEWA_PLUS'}
    />
  );
}
