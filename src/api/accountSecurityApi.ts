import {apiRequest} from './apiClient';

export type SecurityOtpResponse = {
  success: true;
  message: string;
  maskedEmail: string | null;
  resendAfter: number;
  expiresIn: number;
};

type ApiRecord =
  Record<string, unknown>;

function text(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value
    : '';
}

function number(
  value: unknown,
  fallback: number,
): number {
  const parsed =
    typeof value === 'number'
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function otpResponse(
  result: ApiRecord,
): SecurityOtpResponse {
  return {
    success: true,
    message:
      text(result.message) ||
      'Verification code sent.',
    maskedEmail:
      text(
        result.masked_email ??
          result.maskedEmail,
      ) || null,
    resendAfter:
      Math.max(
        0,
        number(
          result.resend_after ??
            result.resendAfter,
          60,
        ),
      ),
    expiresIn:
      Math.max(
        0,
        number(
          result.expires_in ??
            result.expiresIn,
          600,
        ),
      ),
  };
}

export const accountSecurityApi = {
  async requestSetPasswordOtp(
    token: string,
  ): Promise<SecurityOtpResponse> {
    const result =
      await apiRequest<ApiRecord>(
        '/api/account/password/set/otp/request',
        {
          method: 'POST',
          token,
        },
      );

    return otpResponse(result);
  },

  async setPassword(
    token: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    await apiRequest(
      '/api/account/password/set',
      {
        method: 'POST',
        token,
        body: {
          otp,
          new_password:
            newPassword,
          confirm_password:
            newPassword,
        },
      },
    );
  },

  async requestChangePasswordOtp(
    token: string,
    currentPassword: string,
  ): Promise<SecurityOtpResponse> {
    const result =
      await apiRequest<ApiRecord>(
        '/api/account/password/otp/request',
        {
          method: 'POST',
          token,
          body: {
            current_password:
              currentPassword,
          },
        },
      );

    return otpResponse(result);
  },

  async changePassword(
    token: string,
    currentPassword: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    await apiRequest(
      '/api/account/password/update',
      {
        method: 'POST',
        token,
        body: {
          current_password:
            currentPassword,
          otp,
          new_password:
            newPassword,
          confirm_password:
            newPassword,
        },
      },
    );
  },

  async requestEmailChangeOtp(
    token: string,
    newEmail: string,
  ): Promise<SecurityOtpResponse> {
    const result =
      await apiRequest<ApiRecord>(
        '/api/account/email/otp/request',
        {
          method: 'POST',
          token,
          body: {
            new_email:
              newEmail,
            // Compatibility alias for older account-email handler naming.
            email:
              newEmail,
          },
        },
      );

    return otpResponse(result);
  },

  async changeEmail(
    token: string,
    newEmail: string,
    otp: string,
  ): Promise<void> {
    await apiRequest(
      '/api/account/email/update',
      {
        method: 'POST',
        token,
        body: {
          new_email:
            newEmail,
          email:
            newEmail,
          otp,
        },
      },
    );
  },

  async requestDeletionOtp(
    token: string,
  ): Promise<SecurityOtpResponse> {
    const result =
      await apiRequest<ApiRecord>(
        '/api/account/delete/otp/request',
        {
          method: 'POST',
          token,
        },
      );

    return otpResponse(result);
  },

  async scheduleDeletion(
    token: string,
    input:
      | {
          method: 'password';
          password: string;
        }
      | {
          method: 'otp';
          otp: string;
        },
  ): Promise<{
    state: string;
    scheduledFor: string | null;
    remainingDays: number;
  }> {
    const secret =
      input.method ===
      'password'
        ? input.password
        : input.otp;

    const result =
      await apiRequest<ApiRecord>(
        '/api/account/delete',
        {
          method: 'POST',
          token,
          body: {
            confirmation_method:
              input.method,
            password:
              input.method ===
              'password'
                ? input.password
                : undefined,
            otp:
              input.method ===
              'otp'
                ? input.otp
                : undefined,
            // Harmless compatibility field; server-side confirmation method
            // remains authoritative.
            secret,
          },
        },
      );

    return {
      state:
        text(result.state) ||
        'pending',
      scheduledFor:
        text(
          result.scheduled_for ??
            result.scheduledFor,
        ) || null,
      remainingDays:
        Math.max(
          0,
          number(
            result.remaining_days ??
              result.remainingDays,
            30,
          ),
        ),
    };
  },
};
