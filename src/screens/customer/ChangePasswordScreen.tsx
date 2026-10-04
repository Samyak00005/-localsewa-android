import React, {
  useCallback,
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  errorMessage,
} from '../../api/apiClient';
import {useAuth} from '../../auth';
import {
  PasswordInput,
} from '../../components/auth';
import {
  SecurityOtpStatus,
} from '../../components/account';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Input,
} from '../../components/ui';
import {
  useChangePassword,
  useRequestChangePasswordOtp,
} from '../../hooks/useAccountSecurity';
import {
  validateOtp,
  validatePassword,
} from '../../utils/authValidation';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

export function ChangePasswordScreen(): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    clearLocalSession,
  } = useAuth();

  const requestOtp =
    useRequestChangePasswordOtp();

  const change =
    useChangePassword();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [otpSent, setOtpSent] =
    useState(false);

  const [maskedEmail, setMaskedEmail] =
    useState<string | null>(
      null,
    );

  const [resendIn, setResendIn] =
    useState(0);

  const [otp, setOtp] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [screenError, setScreenError] =
    useState<string | null>(
      null,
    );

  const onTick =
    useCallback(
      (value: number) =>
        setResendIn(value),
      [],
    );

  async function sendOtp() {
    setScreenError(null);

    if (!currentPassword) {
      setScreenError(
        'Enter your current password.',
      );
      return;
    }

    try {
      const result =
        await requestOtp.mutateAsync(
          currentPassword,
        );

      setMaskedEmail(
        result.maskedEmail,
      );
      setResendIn(
        result.resendAfter ||
          60,
      );
      setOtpSent(true);
    } catch (
      mutationError
    ) {
      setScreenError(
        errorMessage(
          mutationError,
        ),
      );
    }
  }

  async function submit() {
    setScreenError(null);

    const otpCheck =
      validateOtp(otp);

    if (!otpCheck.valid) {
      setScreenError(
        otpCheck.message,
      );
      return;
    }

    const passwordCheck =
      validatePassword(
        newPassword,
      );

    if (!passwordCheck.valid) {
      setScreenError(
        passwordCheck.message,
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setScreenError(
        'Passwords do not match.',
      );
      return;
    }

    if (
      newPassword ===
      currentPassword
    ) {
      setScreenError(
        'New password must be different from your current password.',
      );
      return;
    }

    try {
      await change.mutateAsync({
        currentPassword,
        otp,
        newPassword,
      });

      // Backend revokes sessions after password mutation.
      // Always clear this device's secure token too.
      await clearLocalSession();
    } catch (
      mutationError
    ) {
      setScreenError(
        errorMessage(
          mutationError,
        ),
      );
    }
  }

  return (
    <ScrollView
      style={{
        backgroundColor:
          theme.colors.background,
      }}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled">
      <AppText variant="h1">
        Change password
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Confirm your current password, then verify the email OTP before setting
        a new password.
      </AppText>

      {screenError ? (
        <View style={styles.section}>
          <AlertBanner variant="error">
            {screenError}
          </AlertBanner>
        </View>
      ) : null}

      <Card style={styles.card}>
        <View style={styles.form}>
          <PasswordInput
            label="Current password"
            placeholder="Enter current password"
            value={
              currentPassword
            }
            onChangeText={
              setCurrentPassword
            }
            editable={
              !otpSent &&
              !requestOtp.isPending
            }
            maxLength={72}
          />

          {!otpSent ? (
            <Button
              label="Send verification code"
              loading={
                requestOtp.isPending
              }
              onPress={sendOtp}
              fullWidth
            />
          ) : (
            <>
              <AlertBanner variant="info">
                Verification code sent
                {maskedEmail
                  ? ` to ${maskedEmail}`
                  : ' to your verified email'}.
              </AlertBanner>

              <Input
                label="6-digit code"
                placeholder="000000"
                value={otp}
                onChangeText={value =>
                  setOtp(
                    value.replace(
                      /\D/g,
                      '',
                    ),
                  )
                }
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                textAlign="center"
                style={styles.otp}
              />

              <SecurityOtpStatus
                seconds={resendIn}
                onTick={onTick}
              />

              <Button
                label="Resend code"
                variant="secondary"
                disabled={
                  resendIn > 0
                }
                loading={
                  requestOtp.isPending
                }
                onPress={sendOtp}
                fullWidth
              />

              <PasswordInput
                label="New password"
                placeholder="8–72 characters"
                value={newPassword}
                onChangeText={
                  setNewPassword
                }
                maxLength={72}
                autoComplete="new-password"
                textContentType="newPassword"
              />

              <PasswordInput
                label="Confirm new password"
                placeholder="Re-enter new password"
                value={
                  confirmPassword
                }
                onChangeText={
                  setConfirmPassword
                }
                maxLength={72}
                autoComplete="new-password"
                textContentType="newPassword"
              />

              <Button
                label="Change password"
                loading={
                  change.isPending
                }
                onPress={submit}
                fullWidth
              />
            </>
          )}
        </View>
      </Card>

      <AppText
        variant="caption"
        muted
        style={styles.note}>
        Successful password change signs you out and revokes active sessions.
        Sign in again with the new password.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom:
      spacing[12],
  },
  subtitle: {
    marginTop:
      spacing[2],
  },
  section: {
    marginTop:
      spacing[4],
  },
  card: {
    marginTop:
      spacing[6],
  },
  form: {
    gap: spacing[4],
  },
  otp: {
    fontSize: 24,
    letterSpacing: 8,
  },
  note: {
    textAlign: 'center',
    marginTop:
      spacing[4],
  },
});
