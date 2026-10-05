import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountApi } from '../api/accountApi';
import { useAuth } from '../auth';
import { VerifiedLocation } from '../types/location';

const PROFILE_KEY = ['customer-profile'] as const;

export function useCustomerProfile() {
  const { token } = useAuth();

  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      return accountApi.profile(token);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

export function useUpdateCustomerProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      phone: string;
      whatsapp: string;
    }) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      return accountApi.updateProfile(token, input);
    },

    onSuccess: profile => {
      queryClient.setQueryData(PROFILE_KEY, profile);
    },
  });
}

export function useUpdateDefaultLocation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: VerifiedLocation) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      return accountApi.updateDefaultLocation(token, location);
    },

    onSuccess: profile => {
      queryClient.setQueryData(PROFILE_KEY, profile);
    },
  });
}

export function useAccountDeletionStatus() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['account-deletion'],
    queryFn: () => {
      if (!token) {
        return Promise.resolve(null);
      }

      return accountApi.deletionStatus(token);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
