import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  notificationApi,
} from '../api/notificationApi';
import {useAuth} from '../auth';
import {
  NotificationFeed,
} from '../types/notification';

const QUERY_KEY = [
  'notifications',
] as const;

export function useNotifications() {
  const {token} = useAuth();

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => {
      if (!token) {
        return Promise.resolve<NotificationFeed>({
          notifications: [],
          unreadCount: 0,
          serverTime: null,
        });
      }

      return notificationApi.list(
        token,
        50,
      );
    },
    enabled:
      Boolean(token),

    // In-app polling only.
    // This is not Android OS push.
    refetchInterval:
      10_000,
    refetchIntervalInBackground:
      false,
    staleTime: 5000,
  });
}

export function useMarkNotificationRead() {
  const {token} = useAuth();
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      notificationId: number,
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      await notificationApi.markRead(
        notificationId,
        token,
      );
    },

    onMutate: async (
      notificationId,
    ) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEY,
      });

      const previous =
        queryClient.getQueryData<NotificationFeed>(
          QUERY_KEY,
        );

      if (previous) {
        queryClient.setQueryData<NotificationFeed>(
          QUERY_KEY,
          {
            ...previous,
            notifications:
              previous.notifications.map(
                item =>
                  item.id ===
                    notificationId &&
                  !item.read
                    ? {
                        ...item,
                        read: true,
                      }
                    : item,
              ),
            unreadCount:
              Math.max(
                0,
                previous.unreadCount -
                  (
                    previous.notifications.some(
                      item =>
                        item.id ===
                          notificationId &&
                        !item.read,
                    )
                      ? 1
                      : 0
                  ),
              ),
          },
        );
      }

      return {previous};
    },

    onError: (
      _error,
      _id,
      context,
    ) => {
      if (
        context?.previous
      ) {
        queryClient.setQueryData(
          QUERY_KEY,
          context.previous,
        );
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          QUERY_KEY,
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const {token} = useAuth();
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      await notificationApi.markAllRead(
        token,
      );
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey:
          QUERY_KEY,
      });

      const previous =
        queryClient.getQueryData<NotificationFeed>(
          QUERY_KEY,
        );

      if (previous) {
        queryClient.setQueryData<NotificationFeed>(
          QUERY_KEY,
          {
            ...previous,
            unreadCount: 0,
            notifications:
              previous.notifications.map(
                item => ({
                  ...item,
                  read: true,
                }),
              ),
          },
        );
      }

      return {previous};
    },

    onError: (
      _error,
      _variables,
      context,
    ) => {
      if (
        context?.previous
      ) {
        queryClient.setQueryData(
          QUERY_KEY,
          context.previous,
        );
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          QUERY_KEY,
      });
    },
  });
}
