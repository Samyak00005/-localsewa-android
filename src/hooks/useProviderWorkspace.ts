import {
  useQuery,
} from '@tanstack/react-query';

import {
  providerWorkspaceApi,
} from '../api/providerWorkspaceApi';
import {
  useAuth,
} from '../auth';

export function useProviderDashboard() {
  const {
    token,
    user,
  } = useAuth();

  return useQuery({
    queryKey: [
      'provider-dashboard',
      user?.id ??
        'guest',
    ],
    queryFn: () => {
      if (!token) {
        throw new Error(
          'Your provider session is unavailable. Sign in again.',
        );
      }

      return providerWorkspaceApi.dashboard(
        token,
      );
    },
    enabled:
      Boolean(
        token &&
          user?.id,
      ),
    staleTime:
      30_000,
  });
}

export function useProviderReviews() {
  const {
    token,
    user,
  } = useAuth();

  return useQuery({
    queryKey: [
      'provider-reviews',
      user?.id ??
        'guest',
    ],
    queryFn: () => {
      if (!token) {
        throw new Error(
          'Your provider session is unavailable. Sign in again.',
        );
      }

      return providerWorkspaceApi.reviews(
        token,
      );
    },
    enabled:
      Boolean(
        token &&
          user?.id,
      ),
    staleTime:
      30_000,
  });
}
