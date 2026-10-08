import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatApi } from '../api/chatApi';
import { useAuth } from '../auth';

export function useBookingChat(bookingId: number) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['booking-chat', bookingId],
    queryFn: () => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      return chatApi.history(bookingId, token);
    },
    enabled: Boolean(token) && Number.isInteger(bookingId) && bookingId > 0,

    // Lightweight foreground polling.
    // Backend has no message push channel in this contract.
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
    staleTime: 1500,
    retry: 1,
  });
}

export function useSendChatMessage(bookingId: number) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!token) {
        throw new Error('Your session is unavailable. Sign in again.');
      }

      await chatApi.send(bookingId, message, token);
    },

    // Mutation retry stays off because the active backend
    // does not consume an idempotency key for messages.
    retry: 0,

    onMutate: async () => {
      // Ignore any older foreground poll that was already in flight before send.
      // The POST itself is still never retried automatically.
      await queryClient.cancelQueries({
        queryKey: ['booking-chat', bookingId],
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['booking-chat', bookingId],
      });
    },
  });
}
