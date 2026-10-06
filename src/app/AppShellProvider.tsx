import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../auth';
import {
  WorkspaceSwitchModal,
} from '../components/navigation/WorkspaceSwitchModal';
import type {
  WorkspaceSwitchTarget,
} from '../components/navigation/WorkspaceSwitchModal';
import { useAppTheme } from '../theme';
import { ProviderTier } from '../types/roles';

export type AppArea = 'auth' | 'customer' | 'provider';

type AppShellContextValue = {
  area: AppArea;
  providerTier: ProviderTier;
  canUseProvider: boolean;
  enterCustomer: () => void;
  enterProvider: () => boolean;
};

const AppShellContext = createContext<AppShellContextValue>({
  area: 'auth',
  providerTier: 'STANDARD',
  canUseProvider: false,
  enterCustomer: () => undefined,
  enterProvider: () => false,
});

function hasRole(roles: string[] | undefined, role: string): boolean {
  return Boolean(
    roles?.some(value => value.toUpperCase() === role.toUpperCase()),
  );
}

export function AppShellProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const { user, restoring } = useAuth();
  const [area, setArea] = useState<AppArea>('auth');

  const [
    switchTarget,
    setSwitchTarget,
  ] =
    useState<WorkspaceSwitchTarget | null>(
      null,
    );

  // Premium entitlement is not connected in v1.6.0.
  // Authenticated Providers use STANDARD until subscription integration.
  const providerTier: ProviderTier = 'STANDARD';

  const { setMode } = useAppTheme();

  const canUseProvider = hasRole(user?.roles, 'PROVIDER');

  const canUseCustomer = hasRole(user?.roles, 'CUSTOMER');

  useEffect(() => {
    if (restoring) {
      return;
    }

    if (!user) {
      setSwitchTarget(
        null,
      );
      setArea('auth');
      return;
    }

    // Keep a valid selected workspace after session refresh.
    if (area === 'provider' && canUseProvider) {
      return;
    }

    if (area === 'customer' && (canUseCustomer || !canUseProvider)) {
      return;
    }

    // Default multi-role accounts to the Customer workspace.
    if (canUseCustomer) {
      setArea('customer');
      return;
    }

    if (canUseProvider) {
      setArea('provider');
      return;
    }

    // Defensive fallback for legacy accounts with no normalized role.
    setArea('customer');
  }, [area, canUseCustomer, canUseProvider, restoring, user]);

  useEffect(() => {
    if (!switchTarget) {
      return;
    }

    const switchTimer =
      setTimeout(() => {
        setArea(
          switchTarget,
        );
      }, 850);

    const closeTimer =
      setTimeout(() => {
        setSwitchTarget(
          null,
        );
      }, 1080);

    return () => {
      clearTimeout(
        switchTimer,
      );
      clearTimeout(
        closeTimer,
      );
    };
  }, [switchTarget]);

  useEffect(() => {
    if (area === 'provider') {
      setMode('providerStandard');
      return;
    }

    setMode('customer');
  }, [area, setMode]);

  const value = useMemo<AppShellContextValue>(
    () => ({
      area,
      providerTier,
      canUseProvider,

      enterCustomer: () => {
        if (
          user &&
          area !==
            'customer' &&
          !switchTarget
        ) {
          setSwitchTarget(
            'customer',
          );
        }
      },

      enterProvider: () => {
        if (
          !user ||
          !canUseProvider
        ) {
          return false;
        }

        if (
          area !==
            'provider' &&
          !switchTarget
        ) {
          setSwitchTarget(
            'provider',
          );
        }

        return true;
      },
    }),
    [
      area,
      canUseProvider,
      providerTier,
      switchTarget,
      user,
    ],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}

      <WorkspaceSwitchModal
        visible={
          switchTarget !=
          null
        }
        target={
          switchTarget ??
          'customer'
        }
      />
    </AppShellContext.Provider>
  );
}

export function useAppShell(): AppShellContextValue {
  return useContext(AppShellContext);
}
