import {
  ApiError,
  apiRequest,
} from './apiClient';

export type AuthUser = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  profile_image: string | null;
  roles: string[];
};

export type AuthResult = {
  success: true;
  token: string;
  user: AuthUser;
  message: string;
};

export type OtpResult = {
  success: true;
  message: string;
  resend_after: number;
};

export type RegistrationDraft = {
  full_name: string;
  phone: string;
  email: string;
  password: string;
};

export type RegistrationPayload =
  RegistrationDraft & {
    registration_otp: string;
  };

function validateUser(user: AuthUser): AuthUser {
  if (
    !user ||
    !Number.isInteger(user.id) ||
    typeof user.full_name !== 'string' ||
    !Array.isArray(user.roles)
  ) {
    throw new ApiError(
      'The server returned invalid account details. Please try again.',
    );
  }

  return {
    ...user,
    roles: user.roles
      .filter(role => typeof role === 'string')
      .map(role => role.toUpperCase()),
  };
}

function validateAuth(
  result: AuthResult,
): AuthResult {
  const user = validateUser(result.user);

  if (
    typeof result.token !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(result.token)
  ) {
    throw new ApiError(
      'The server returned an invalid session. Please try again.',
    );
  }

  return {
    ...result,
    user,
  };
}

export const authApi = {
  checkAccount: (
    identifier: string,
  ) =>
    apiRequest<{
      success: true;
      account_exists: boolean;
      identifier: string;
    }>('/api/auth/account/check', {
      method: 'POST',
      body: {identifier},
    }),

  login: async (
    identifier: string,
    password: string,
  ) =>
    validateAuth(
      await apiRequest<AuthResult>(
        '/api/auth/login',
        {
          method: 'POST',
          body: {identifier, password},
        },
      ),
    ),

  registrationOtp: (
    details: Pick<
      RegistrationDraft,
      'full_name' | 'phone' | 'email'
    >,
  ) =>
    apiRequest<OtpResult>(
      '/api/auth/registration/otp/request',
      {
        method: 'POST',
        body: {
          ...details,
          intent: 'customer_signup',
        },
      },
    ),

  register: async (
    details: RegistrationPayload,
  ) =>
    validateAuth(
      await apiRequest<AuthResult>(
        '/api/auth/customer/register',
        {
          method: 'POST',
          body: details,
        },
      ),
    ),

  passwordOtp: (email: string) =>
    apiRequest<OtpResult>(
      '/api/auth/password/otp/request',
      {
        method: 'POST',
        body: {
          purpose: 'forgot',
          email,
        },
      },
    ),

  resetPassword: (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    apiRequest<{
      success: true;
      message: string;
    }>('/api/auth/password/update', {
      method: 'POST',
      body: {
        purpose: 'forgot',
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
    }),

  session: async (token: string) => {
    const result = await apiRequest<{
      success: true;
      user: AuthUser;
      expires_at: string | null;
    }>('/api/auth/session', {token});

    return {
      ...result,
      user: validateUser(result.user),
    };
  },

  logout: (token: string) =>
    apiRequest<{
      success: true;
      message?: string;
    }>('/api/auth/logout', {
      method: 'POST',
      token,
    }),

  logoutAll: (token: string) =>
    apiRequest<{
      success: true;
      message: string;
      revoked_sessions: number;
    }>('/api/auth/logout-all', {
      method: 'POST',
      token,
    }),
};
