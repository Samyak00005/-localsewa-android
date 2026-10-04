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
  useRequestSetPasswordOtp,
  useSetPassword,
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

export function SetPasswordScreen(): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    clearLocalSession,
  } = useAuth();

  const requestOtp =
    useRequestSetPasswordOtp();

  const setPassword =
    useSetPassword();

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

  const [password, setPasswordValue] =
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

    try {
      const result =
        await requestOtp.mutateAsync();

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
        password,
      );

    if (!passwordCheck.valid) {
      setScreenError(
        passwordCheck.message,
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setScreenError(
        'Passwords do not match.',
      );
      return;
    }

    try {
      await setPassword.mutateAsync({
        otp,
        newPassword:
          password,
      });

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
        Set a password
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        This flow is for Google-first accounts that do not yet have a
        user-chosen Localsewa password.
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
                value={password}
                onChangeText={
                  setPasswordValue
                }
                maxLength={72}
                autoComplete="new-password"
                textContentType="newPassword"
              />

              <PasswordInput
                label="Confirm password"
                placeholder="Re-enter password"
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
                label="Set password"
                loading={
                  setPassword.isPending
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
        If this account already has a password, the backend will reject this
        flow. Use Change password instead.
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
