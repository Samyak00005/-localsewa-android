import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  accountSecurityApi,
} from '../api/accountSecurityApi';
import {useAuth} from '../auth';

export function useRequestChangePasswordOtp() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: (
      currentPassword: string,
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.requestChangePasswordOtp(
        token,
        currentPassword,
      );
    },
  });
}

export function useChangePassword() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: (
      input: {
        currentPassword: string;
        otp: string;
        newPassword: string;
      },
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.changePassword(
        token,
        input.currentPassword,
        input.otp,
        input.newPassword,
      );
    },
  });
}

export function useRequestSetPasswordOtp() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.requestSetPasswordOtp(
        token,
      );
    },
  });
}

export function useSetPassword() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: (
      input: {
        otp: string;
        newPassword: string;
      },
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.setPassword(
        token,
        input.otp,
        input.newPassword,
      );
    },
  });
}

export function useRequestEmailChangeOtp() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: (
      email: string,
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.requestEmailChangeOtp(
        token,
        email,
      );
    },
  });
}

export function useChangeEmail() {
  const {token} = useAuth();
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: {
        email: string;
        otp: string;
      },
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.changeEmail(
        token,
        input.email,
        input.otp,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'customer-profile',
        ],
      });
    },
  });
}

export function useRequestDeletionOtp() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.requestDeletionOtp(
        token,
      );
    },
  });
}

export function useScheduleAccountDeletion() {
  const {token} = useAuth();

  return useMutation({
    mutationFn: (
      input:
        | {
            method:
              'password';
            password:
              string;
          }
        | {
            method: 'otp';
            otp: string;
          },
    ) => {
      if (!token) {
        throw new Error(
          'Your session is unavailable. Sign in again.',
        );
      }

      return accountSecurityApi.scheduleDeletion(
        token,
        input,
      );
    },
  });
}
