import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {AppState} from 'react-native';

import {
  ApiError,
  errorMessage,
} from '../api/apiClient';
import {
  authApi,
  AuthResult,
  AuthUser,
  OtpResult,
  RegistrationDraft,
} from '../api/authApi';
import {
  normalizeEmail,
  normalizePhone,
} from '../utils/authValidation';
import {sessionStorage} from './sessionStorage';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  restoring: boolean;
  sessionError: string | null;
};

type AuthContextValue = AuthState & {
  signIn: (
    identifier: string,
    password: string,
  ) => Promise<void>;

  requestRegistrationOtp: (
    draft: RegistrationDraft,
  ) => Promise<OtpResult>;

  resendRegistrationOtp:
    () => Promise<OtpResult>;

  completeRegistration: (
    otp: string,
  ) => Promise<void>;

  requestPasswordOtp: (
    email: string,
  ) => Promise<OtpResult>;

  resendPasswordOtp:
    () => Promise<OtpResult>;

  setPasswordResetOtp: (
    otp: string,
  ) => void;

  completePasswordReset: (
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;

  refreshSession: () => Promise<void>;
  clearLocalSession: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<number>;

  registrationIdentifier: string | null;
  passwordResetEmail: string | null;
};

const emptyState: AuthState = {
  token: null,
  user: null,
  restoring: false,
  sessionError: null,
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [state, setState] =
    useState<AuthState>({
      ...emptyState,
      restoring: true,
    });

  const registrationDraft =
    useRef<RegistrationDraft | null>(null);
  const resetEmail =
    useRef<string | null>(null);
  const resetOtp =
    useRef<string | null>(null);

  const revision = useRef(0);
  const currentToken =
    useRef<string | null>(null);
  const refreshing = useRef(false);

  const acceptSession = useCallback(
    async (result: AuthResult) => {
      revision.current += 1;

      try {
        await sessionStorage.save(
          result.token,
        );
      } catch {
        await authApi
          .logout(result.token)
          .catch(() => undefined);

        throw new Error(
          'Secure session storage is unavailable. Please rebuild the app and try again.',
        );
      }

      currentToken.current =
        result.token;

      registrationDraft.current = null;
      resetEmail.current = null;
      resetOtp.current = null;

      setState({
        token: result.token,
        user: result.user,
        restoring: false,
        sessionError: null,
      });
    },
    [],
  );

  const refreshSession =
    useCallback(async () => {
      if (refreshing.current) {
        return;
      }

      refreshing.current = true;
      const version = revision.current;

      setState(previous => ({
        ...previous,
        restoring: true,
        sessionError: null,
      }));

      try {
        const token =
          currentToken.current ??
          (await sessionStorage.read());

        if (
          version !== revision.current
        ) {
          return;
        }

        currentToken.current = token;

        if (!token) {
          setState(emptyState);
          return;
        }

        const result =
          await authApi.session(token);

        if (
          version === revision.current
        ) {
          setState({
            token,
            user: result.user,
            restoring: false,
            sessionError: null,
          });
        }
      } catch (error) {
        if (
          version !== revision.current
        ) {
          return;
        }

        if (
          error instanceof ApiError &&
          [401, 403].includes(error.status)
        ) {
          currentToken.current = null;

          try {
            await sessionStorage.clear();
          } catch {
            // Invalid token cannot grant access even if cleanup fails.
          }

          setState(emptyState);
          return;
        }

        setState({
          token: currentToken.current,
          user: null,
          restoring: false,
          sessionError:
            errorMessage(error),
        });
      } finally {
        refreshing.current = false;
      }
    }, []);

  useEffect(() => {
    refreshSession().catch(
      () => undefined,
    );

    const listener =
      AppState.addEventListener(
        'change',
        nextState => {
          if (nextState === 'active') {
            refreshSession().catch(
              () => undefined,
            );
          }
        },
      );

    return () => {
      listener.remove();
    };
  }, [refreshSession]);

  const signIn = useCallback(
    async (
      identifier: string,
      password: string,
    ) => {
      const cleanIdentifier =
        identifier.trim();

      // Login goes directly to the authentication endpoint.
      // We intentionally avoid a separate pre-login account-existence check
      // so the client does not add an unnecessary account-enumeration step.
      const result =
        await authApi.login(
          cleanIdentifier,
          password,
        );

      await acceptSession(result);
    },
    [acceptSession],
  );

  const requestRegistrationOtp =
    useCallback(
      async (
        draft: RegistrationDraft,
      ) => {
        const normalized: RegistrationDraft = {
          full_name:
            draft.full_name.trim(),
          phone:
            normalizePhone(draft.phone),
          email:
            normalizeEmail(draft.email),
          password: draft.password,
        };

        const result =
          await authApi.registrationOtp({
            full_name:
              normalized.full_name,
            phone: normalized.phone,
            email: normalized.email,
          });

        registrationDraft.current =
          normalized;

        return result;
      },
      [],
    );

  const resendRegistrationOtp =
    useCallback(async () => {
      const draft =
        registrationDraft.current;

      if (!draft) {
        throw new Error(
          'Registration session expired. Start registration again.',
        );
      }

      return authApi.registrationOtp({
        full_name: draft.full_name,
        phone: draft.phone,
        email: draft.email,
      });
    }, []);

  const completeRegistration =
    useCallback(
      async (otp: string) => {
        const draft =
          registrationDraft.current;

        if (!draft) {
          throw new Error(
            'Registration session expired. Start registration again.',
          );
        }

        const result =
          await authApi.register({
            ...draft,
            registration_otp:
              otp.trim(),
          });

        await acceptSession(result);
      },
      [acceptSession],
    );

  const requestPasswordOtp =
    useCallback(async (email: string) => {
      const normalized =
        normalizeEmail(email);

      const result =
        await authApi.passwordOtp(
          normalized,
        );

      resetEmail.current =
        normalized;
      resetOtp.current = null;

      return result;
    }, []);

  const resendPasswordOtp =
    useCallback(async () => {
      if (!resetEmail.current) {
        throw new Error(
          'Password recovery session expired. Start again.',
        );
      }

      return authApi.passwordOtp(
        resetEmail.current,
      );
    }, []);

  const setPasswordResetOtp =
    useCallback((otp: string) => {
      resetOtp.current = otp.trim();
    }, []);

  const completePasswordReset =
    useCallback(
      async (
        newPassword: string,
        confirmPassword: string,
      ) => {
        const email =
          resetEmail.current;
        const otp =
          resetOtp.current;

        if (!email || !otp) {
          throw new Error(
            'Password recovery session expired. Start again.',
          );
        }

        await authApi.resetPassword(
          email,
          otp,
          newPassword,
          confirmPassword,
        );

        resetEmail.current = null;
        resetOtp.current = null;
      },
      [],
    );

  const clearLocalSession =
    useCallback(async () => {
      revision.current += 1;
      currentToken.current = null;
      setState(emptyState);
      await sessionStorage.clear();
    }, []);

  const logout = useCallback(async () => {
    const token =
      currentToken.current ??
      (await sessionStorage.read());

    if (token) {
      try {
        await authApi.logout(token);
      } catch (error) {
        if (
          !(
            error instanceof ApiError &&
            error.status === 401
          )
        ) {
          throw error;
        }
      }
    }

    await clearLocalSession();
  }, [clearLocalSession]);

  const logoutAll =
    useCallback(async () => {
      const token =
        currentToken.current ??
        (await sessionStorage.read());

      if (!token) {
        await clearLocalSession();
        return 0;
      }

      const result =
        await authApi.logoutAll(token);

      await clearLocalSession();

      return result.revoked_sessions;
    }, [clearLocalSession]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        requestRegistrationOtp,
        resendRegistrationOtp,
        completeRegistration,
        requestPasswordOtp,
        resendPasswordOtp,
        setPasswordResetOtp,
        completePasswordReset,
        refreshSession,
        clearLocalSession,
        logout,
        logoutAll,
        registrationIdentifier:
          registrationDraft.current
            ? registrationDraft.current.phone ||
              registrationDraft.current.email
            : null,
        passwordResetEmail:
          resetEmail.current,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'AuthProvider is missing.',
    );
  }

  return context;
}
