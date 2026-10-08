import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookingApi } from '../api/bookingApi';
import { categoryApi } from '../api/categoryApi';
import { customerApi } from '../api/customerApi';
import { providerApi, ProviderListOptions } from '../api/providerApi';
import { useAuth } from '../auth';
import { VerifiedLocation } from '../types/location';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
    staleTime: 5 * 60_000,
  });
}

export function useProviders(options: ProviderListOptions = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [
      'providers',
      options.q ?? '',
      options.category ?? '',
      options.latitude ?? null,
      options.longitude ?? null,
      options.limit ?? 150,
    ],
    queryFn: () => providerApi.list(token, options),
    staleTime: 60_000,
  });
}

export function useProviderDetails(providerId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => providerApi.details(providerId, token),
    enabled: Boolean(providerId),
  });
}

export function useSavedProviders() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['saved-providers', user?.id ?? 'guest'],
    queryFn: () => {
      if (!token) {
        return Promise.resolve([]);
      }

      return customerApi.savedProviders(token);
    },
    enabled: Boolean(token && user?.id),
    staleTime: 30_000,
  });
}

export function useSaveProvider() {
  const { token, user } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerRef: string) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      await customerApi.saveProvider(providerRef, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['saved-providers', user?.id ?? 'guest'],
      });
    },
  });
}

export function useRemoveSavedProvider() {
  const { token, user } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerRef: string) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      await customerApi.removeSavedProvider(providerRef, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['saved-providers', user?.id ?? 'guest'],
      });
    },
  });
}

export function useCustomerBookings() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['customer-bookings'],
    queryFn: () => {
      if (!token) {
        return Promise.resolve([]);
      }

      return bookingApi.listCustomer(token);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const { token } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      providerId: string;
      providerServiceId?: number;
      customServiceName?: string;
      bookingDate: string;
      bookingTime: string;
      note?: string;
      location: VerifiedLocation;
      requestId: string;
    }) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      return bookingApi.create(input, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['customer-bookings'],
      });
    },
  });
}

export function useCancelBooking() {
  const { token } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: number) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      await bookingApi.cancel(bookingId, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['customer-bookings'],
      });
    },
  });
}

export function useReviewBooking() {
  const { token } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      rating,
      comment,
    }: {
      bookingId: number;
      rating: number;
      comment: string;
    }) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      await bookingApi.review(bookingId, rating, comment, token);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['customer-bookings'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['providers'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['provider'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['home-review-highlights'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['provider-reviews'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['provider-dashboard'],
        }),
      ]);
    },
  });
}
