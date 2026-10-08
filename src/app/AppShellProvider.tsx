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
import { useProviderMembership } from '../hooks/useProviderWorkspace';
import { ProviderTier } from '../types/roles';
import {
  ProviderThemePreference,
  providerThemePreferenceStorage,
} from './providerThemePreference';

export type AppArea = 'auth' | 'customer' | 'provider';

export type ProviderEntryTarget =
  | { route: 'ProviderHome' | 'ProviderRequests' }
  | {
      route: 'ProviderRequestDetails' | 'ProviderBookingChat';
      bookingId: number;
    };

type AppShellContextValue = {
  area: AppArea;
  providerTier: ProviderTier;
  canUseProvider: boolean;
  providerThemePreference: ProviderThemePreference;
  providerPremiumVisuals: boolean;
  setProviderThemePreference: (preference: ProviderThemePreference) => void;
  pendingProviderTarget: ProviderEntryTarget | null;
  consumeProviderTarget: () => void;
  enterCustomer: () => void;
  enterProvider: (target?: ProviderEntryTarget) => boolean;
};

const AppShellContext = createContext<AppShellContextValue>({
  area: 'auth',
  providerTier: 'STANDARD',
  canUseProvider: false,
  providerThemePreference: 'premium',
  providerPremiumVisuals: false,
  setProviderThemePreference: () => undefined,
  pendingProviderTarget: null,
  consumeProviderTarget: () => undefined,
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
  const [providerThemePreference, setProviderThemePreferenceState] =
    useState<ProviderThemePreference>('premium');
  const [pendingProviderTarget, setPendingProviderTarget] =
    useState<ProviderEntryTarget | null>(null);

  const [
    switchTarget,
    setSwitchTarget,
  ] =
    useState<WorkspaceSwitchTarget | null>(
      null,
    );

  const { setMode } = useAppTheme();

  const canUseProvider = hasRole(user?.roles, 'PROVIDER');
  const canUseCustomer = hasRole(user?.roles, 'CUSTOMER');

  const { data: providerMembership } = useProviderMembership(canUseProvider);

  const providerTier: ProviderTier = providerMembership?.active
    ? 'LOCALSEWA_PLUS'
    : 'STANDARD';

  const providerPremiumVisuals =
    providerTier === 'LOCALSEWA_PLUS' && providerThemePreference === 'premium';

  useEffect(() => {
    let active = true;
    const userId = user?.id;

    setProviderThemePreferenceState('premium');

    if (!userId) {
      return () => {
        active = false;
      };
    }

    providerThemePreferenceStorage
      .read(userId)
      .then(preference => {
        if (active && preference) {
          setProviderThemePreferenceState(preference);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (restoring) {
      return;
    }

    if (!user) {
      setSwitchTarget(
        null,
      );
      setPendingProviderTarget(null);
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
      setMode(
        providerPremiumVisuals ? 'providerPremium' : 'providerStandard',
      );
      return;
    }

    setMode('customer');
  }, [area, providerPremiumVisuals, setMode]);

  const value = useMemo<AppShellContextValue>(
    () => ({
      area,
      providerTier,
      canUseProvider,
      providerThemePreference,
      providerPremiumVisuals,
      pendingProviderTarget,
      consumeProviderTarget: () => setPendingProviderTarget(null),
      setProviderThemePreference: preference => {
        setProviderThemePreferenceState(preference);

        if (user?.id) {
          providerThemePreferenceStorage
            .save(user.id, preference)
            .catch(() => undefined);
        }
      },

      enterCustomer: () => {
        setPendingProviderTarget(null);
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

      enterProvider: target => {
        if (
          !user ||
          !canUseProvider
        ) {
          return false;
        }

        if (target) {
          setPendingProviderTarget(target);
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
      providerThemePreference,
      providerPremiumVisuals,
      pendingProviderTarget,
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
