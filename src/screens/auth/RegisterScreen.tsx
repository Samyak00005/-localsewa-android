import React, {useState} from 'react';
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
import {
  AuthScreenLayout,
  PasswordInput,
} from '../../components/auth';
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
  normalizeEmail,
  normalizePhone,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from '../../utils/authValidation';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

export function RegisterScreen({
  navigation,
}: Props): React.JSX.Element {
  const {
    requestRegistrationOtp,
  } = useAuth();
  const {theme} = useAppTheme();

  const [fullName, setFullName] =
    useState('');
  const [mobile, setMobile] =
    useState('');
  const [email, setEmail] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');
  const [busy, setBusy] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function submit() {
    setError(null);

    const checks = [
      validateFullName(fullName),
      validatePhone(mobile),
      validateEmail(email),
      validatePassword(password),
    ];

    const failed =
      checks.find(
        result => !result.valid,
      );

    if (
      failed &&
      !failed.valid
    ) {
      setError(failed.message);
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        'Passwords do not match.',
      );
      return;
    }

    setBusy(true);

    try {
      const result =
        await requestRegistrationOtp({
          full_name: fullName.trim(),
          phone:
            normalizePhone(mobile),
          email:
            normalizeEmail(email),
          password,
        });

      navigation.navigate('Otp', {
        purpose: 'registration',
        identifier:
          normalizePhone(mobile),
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
      eyebrow="CREATE ACCOUNT"
      title="Join Localsewa"
      description="Create one account for Localsewa. Provider capability can be attached to the same account when active.">
      <View style={styles.form}>
        {error ? (
          <AlertBanner variant="error">
            {error}
          </AlertBanner>
        ) : null}

        <Input
          label="Full name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={80}
        />

        <Input
          label="Mobile number"
          placeholder="+91"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={20}
        />

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          maxLength={254}
          helperText="Verification and account recovery use this email."
        />

        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={128}
          helperText="Use at least 8 characters."
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={128}
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Button
          label="Send verification code"
          loading={busy}
          onPress={submit}
          fullWidth
        />

        <View style={styles.footerRow}>
          <AppText
            variant="bodySmall"
            muted>
            Already have an account?
          </AppText>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() =>
              navigation.navigate(
                'Login',
              )
            }>
            <AppText
              variant="label"
              color={theme.colors.primary}>
              Sign in
            </AppText>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing[4],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    alignItems: 'center',
  },
});
