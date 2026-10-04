import React, {
  useEffect,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  errorMessage,
} from '../../api/apiClient';
import {useAuth} from '../../auth';
import {AuthScreenLayout} from '../../components/auth';
import {
  AlertBanner,
  AppText,
  Button,
  Input,
} from '../../components/ui';
import {
  spacing,
  useAppTheme,
} from '../../theme';
import {AuthStackParamList} from '../../navigation/types';
import {
  validateOtp,
} from '../../utils/authValidation';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Otp'
>;

export function OtpScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {
    completeRegistration,
    resendRegistrationOtp,
    resendPasswordOtp,
    setPasswordResetOtp,
  } = useAuth();
  const {theme} = useAppTheme();

  const [otp, setOtp] =
    useState('');
  const [busy, setBusy] =
    useState(false);
  const [resending, setResending] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [resendIn, setResendIn] =
    useState(
      Math.max(
        0,
        route.params.resendAfter ?? 0,
      ),
    );

  const isRegistration =
    route.params.purpose ===
    'registration';

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const timer = setTimeout(
      () =>
        setResendIn(value =>
          Math.max(0, value - 1),
        ),
      1000,
    );

    return () =>
      clearTimeout(timer);
  }, [resendIn]);

  async function submit() {
    setError(null);

    const check = validateOtp(otp);

    if (!check.valid) {
      setError(check.message);
      return;
    }

    setBusy(true);

    try {
      if (isRegistration) {
        await completeRegistration(
          otp.trim(),
        );
        return;
      }

      setPasswordResetOtp(
        otp.trim(),
      );

      navigation.replace(
        'ResetPassword',
        {
          identifier:
            route.params.identifier,
        },
      );
    } catch (submitError) {
      setError(
        errorMessage(submitError),
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (
      resendIn > 0 ||
      resending ||
      busy
    ) {
      return;
    }

    setResending(true);
    setError(null);

    try {
      const result =
        isRegistration
          ? await resendRegistrationOtp()
          : await resendPasswordOtp();

      setResendIn(
        Math.max(
          1,
          result.resend_after || 30,
        ),
      );
    } catch (resendError) {
      setError(
        errorMessage(resendError),
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="VERIFICATION"
      title="Enter verification code"
      description={
        route.params.identifier
          ? `Enter the 6-digit code sent for ${route.params.identifier}.`
          : 'Enter the 6-digit verification code sent to your account.'
      }>
      <View style={styles.form}>
        {error ? (
          <AlertBanner variant="error">
            {error}
          </AlertBanner>
        ) : null}

        <Input
          label="Verification code"
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
          returnKeyType="done"
          onSubmitEditing={submit}
          style={styles.otpInput}
        />

        <Button
          label={
            isRegistration
              ? 'Verify & create account'
              : 'Continue'
          }
          loading={busy}
          onPress={submit}
          fullWidth
        />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled:
              resendIn > 0 ||
              resending ||
              busy,
          }}
          disabled={
            resendIn > 0 ||
            resending ||
            busy
          }
          onPress={resend}
          style={styles.resend}>
          <AppText
            variant="label"
            color={
              resendIn > 0
                ? theme.colors.textMuted
                : theme.colors.primary
            }>
            {resending
              ? 'Sending…'
              : resendIn > 0
                ? `Resend code in ${resendIn}s`
                : 'Resend code'}
          </AppText>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing[4],
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
  },
  resend: {
    alignSelf: 'center',
  },
});
