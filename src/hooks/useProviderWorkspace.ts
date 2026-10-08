import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { bookingApi } from '../api/bookingApi';
import { providerWorkspaceApi } from '../api/providerWorkspaceApi';
import { useAuth } from '../auth';
import type {
  ProviderBusinessImage,
  ProviderDashboardData,
  ProviderProfileUpdate,
  ProviderServiceInput,
} from '../types/providerWorkspace';

const dashboardKey = (userId: number | string | undefined) => [
  'provider-dashboard',
  userId ?? 'guest',
] as const;

const servicesKey = (userId: number | string | undefined) => [
  'provider-services',
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

const requestCountKey = (userId: number | string | undefined) => [
  'provider-request-count',
  userId ?? 'guest',
] as const;

const bookingsKey = (userId: number | string | undefined) => [
  'provider-bookings',
  userId ?? 'guest',
] as const;

function syncBusinessImages(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: number | string | undefined,
  images: ProviderBusinessImage[],
) {
  queryClient.setQueryData<ProviderDashboardData>(
    dashboardKey(userId),
    current =>
      current
        ? {
            ...current,
            profile: {
              ...current.profile,
              businessImages: images,
            },
          }
        : current,
  );
}

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

export function useProviderRequestCount() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: requestCountKey(user?.id),
    queryFn: () => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.requestCount(token);
    },
    enabled: Boolean(token && user?.id),
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useProviderBookings() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: bookingsKey(user?.id),
    queryFn: () => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return bookingApi.listProvider(token);
    },
    enabled: Boolean(token && user?.id),
    staleTime: 20_000,
  });
}

export function useProviderBookingStatusUpdate() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
      reason,
    }: {
      bookingId: number;
      status: import('../types/booking').BookingStatus;
      reason?: string;
    }) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      await bookingApi.updateStatus(bookingId, status, token, reason);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookingsKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: requestCountKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
      ]);
    },
  });
}


export function useProviderServices() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: servicesKey(user?.id),
    queryFn: () => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.services(token);
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



export function useCreateProviderService() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProviderServiceInput) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.createService(token, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: servicesKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
  });
}

export function useUpdateProviderService() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      input,
    }: {
      serviceId: number;
      input: ProviderServiceInput;
    }) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.updateService(token, serviceId, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: servicesKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
  });
}

export function useDeleteProviderService() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: number) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      await providerWorkspaceApi.deleteService(token, serviceId);
      return serviceId;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: servicesKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
  });
}

export function useProviderCategoryUpdate() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      await providerWorkspaceApi.updateCategory(token, categoryId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
  });
}

export function useProviderBusinessImageUpload() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: {
      uri: string;
      name: string;
      type: string;
    }) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.uploadBusinessImage(token, image);
    },
    onSuccess: async images => {
      syncBusinessImages(queryClient, user?.id, images);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
  });
}

export function useProviderBusinessImageMoveFirst() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: number) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.setBusinessImageFirst(token, imageId);
    },
    onSuccess: async images => {
      syncBusinessImages(queryClient, user?.id, images);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
  });
}

export function useProviderBusinessImageDelete() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: number) => {
      if (!token) {
        throw new Error('Your provider session is unavailable. Sign in again.');
      }

      return providerWorkspaceApi.deleteBusinessImage(token, imageId);
    },
    onSuccess: async images => {
      syncBusinessImages(queryClient, user?.id, images);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardKey(user?.id) }),
        queryClient.invalidateQueries({ queryKey: ['providers'] }),
        queryClient.invalidateQueries({ queryKey: ['provider'] }),
      ]);
    },
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
