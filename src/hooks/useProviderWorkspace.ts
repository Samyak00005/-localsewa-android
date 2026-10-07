import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { providerWorkspaceApi } from '../api/providerWorkspaceApi';
import { useAuth } from '../auth';
import type {
  ProviderDashboardData,
  ProviderProfileUpdate,
} from '../types/providerWorkspace';

const dashboardKey = (userId: number | string | undefined) => [
  'provider-dashboard',
  userId ?? 'guest',
] as const;

const reviewsKey = (userId: number | string | undefined) => [
  'provider-reviews',
  userId ?? 'guest',
] as const;

const membershipKey = (userId: number | string | undefined) => [
  'provider-membership',
  userId ?? 'guest',
] as const;

export function useProviderDashboard() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: dashboardKey(user?.id),
    queryFn: () => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.dashboard(token);
    },
    enabled: Boolean(token && user?.id),
    staleTime: 30_000,
  });
}

export function useProviderReviews() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: reviewsKey(user?.id),
    queryFn: () => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.reviews(token);
    },
    enabled: Boolean(token && user?.id),
    staleTime: 30_000,
  });
}

export function useProviderMembership(enabled = true) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: membershipKey(user?.id),
    queryFn: () => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.membership(token);
    },
    enabled: Boolean(enabled && token && user?.id),
    staleTime: 30_000,
    refetchInterval: enabled ? 30_000 : false,
    refetchIntervalInBackground: false,
  });
}


export function useProviderProfileUpdate() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ProviderProfileUpdate) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      await providerWorkspaceApi.updateProfile(token, profile);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) });
    },
  });
}

export function useProviderAvailability() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (available: boolean) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      await providerWorkspaceApi.setAvailability(token, available);
      return available;
    },
    onMutate: async available => {
      const key = dashboardKey(user?.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ProviderDashboardData>(key);

      if (previous) {
        queryClient.setQueryData<ProviderDashboardData>(key, {
          ...previous,
          profile: {
            ...previous.profile,
            available,
          },
        });
      }

      return { previous, key };
    },
    onError: (_error, _available, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) });
    },
  });
}
