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
  useCustomerProfile,
} from '../../hooks/useAccount';
import {
  useChangeEmail,
  useRequestEmailChangeOtp,
} from '../../hooks/useAccountSecurity';
import {
  normalizeEmail,
  validateEmail,
  validateOtp,
} from '../../utils/authValidation';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

export function ChangeEmailScreen(): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    clearLocalSession,
  } = useAuth();

  const {
    data: profile,
  } = useCustomerProfile();

  const requestOtp =
    useRequestEmailChangeOtp();

  const changeEmail =
    useChangeEmail();

  const [email, setEmail] =
    useState('');

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

    const check =
      validateEmail(email);

    if (!check.valid) {
      setScreenError(
        check.message,
      );
      return;
    }

    const normalized =
      normalizeEmail(email);

    if (
      normalized ===
      profile?.email?.toLowerCase()
    ) {
      setScreenError(
        'Enter a different email address.',
      );
      return;
    }

    try {
      const result =
        await requestOtp.mutateAsync(
          normalized,
        );

      setEmail(normalized);
      setMaskedEmail(
        result.maskedEmail ??
          normalized,
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

    try {
      await changeEmail.mutateAsync({
        email:
          normalizeEmail(email),
        otp,
      });

      // Treat account-email replacement as a reauthentication boundary.
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
        Change account email
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        The verification code is sent to the new email address before Localsewa
        replaces your current account email.
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
          <Input
            label="Current email"
            value={
              profile?.email ?? ''
            }
            editable={false}
          />

          <Input
            label="New email"
            placeholder="new@example.com"
            value={email}
            onChangeText={value => {
              setEmail(value);
              if (otpSent) {
                setOtpSent(false);
                setOtp('');
                setResendIn(0);
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={254}
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
                  : ' to the new email'}.
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

              <Button
                label="Verify & change email"
                loading={
                  changeEmail.isPending
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
        After a successful email change, the app signs out locally. Sign in
        again using the updated account identity.
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
