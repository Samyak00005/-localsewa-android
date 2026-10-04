import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
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
  Button,
  Input,
} from '../../components/ui';
import {spacing} from '../../theme';
import {AuthStackParamList} from '../../navigation/types';
import {
  normalizeEmail,
  validateEmail,
} from '../../utils/authValidation';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

export function ForgotPasswordScreen({
  navigation,
}: Props): React.JSX.Element {
  const {requestPasswordOtp} =
    useAuth();

  const [email, setEmail] =
    useState('');
  const [busy, setBusy] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function submit() {
    setError(null);

    const check =
      validateEmail(email);

    if (!check.valid) {
      setError(check.message);
      return;
    }

    setBusy(true);

    try {
      const normalized =
        normalizeEmail(email);

      const result =
        await requestPasswordOtp(
          normalized,
        );

      navigation.navigate('Otp', {
        purpose: 'password',
        identifier: normalized,
        resendAfter:
          result.resend_after,
      });
    } catch (submitError) {
      setError(
        errorMessage(submitError),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="PASSWORD RECOVERY"
      title="Reset your password"
      description="Enter your account email. Localsewa will send a verification code before allowing a password change.">
      <View style={styles.form}>
        {error ? (
          <AlertBanner variant="error">
            {error}
          </AlertBanner>
        ) : null}

        <Input
          label="Account email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          maxLength={254}
          returnKeyType="send"
          onSubmitEditing={submit}
        />

        <Button
          label="Send verification code"
          loading={busy}
          onPress={submit}
          fullWidth
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing[4],
  },
});
