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
  validateIdentifier,
} from '../../utils/authValidation';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Login'
>;

export function LoginScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {signIn} = useAuth();
  const {theme} = useAppTheme();

  const [identifier, setIdentifier] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [busy, setBusy] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function submit() {
    setError(null);

    const identifierCheck =
      validateIdentifier(identifier);

    if (!identifierCheck.valid) {
      setError(
        identifierCheck.message,
      );
      return;
    }

    if (!password) {
      setError(
        'Enter your password.',
      );
      return;
    }

    setBusy(true);

    try {
      await signIn(
        identifier,
        password,
      );
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
      eyebrow="SIGN IN"
      title="Welcome back"
      description="Use your Localsewa account to continue.">
      <View style={styles.form}>
        {route.params?.notice ? (
          <AlertBanner variant="success">
            {route.params.notice}
          </AlertBanner>
        ) : null}

        {error ? (
          <AlertBanner variant="error">
            {error}
          </AlertBanner>
        ) : null}

        <Input
          label="Email or mobile number"
          placeholder="Enter email or mobile"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          maxLength={254}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          maxLength={128}
          onSubmitEditing={submit}
        />

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() =>
            navigation.navigate(
              'ForgotPassword',
            )
          }
          style={styles.forgot}>
          <AppText
            variant="label"
            color={theme.colors.primary}>
            Forgot password?
          </AppText>
        </Pressable>

        <Button
          label="Sign in"
          loading={busy}
          onPress={submit}
          fullWidth
        />

        <View style={styles.footerRow}>
          <AppText
            variant="bodySmall"
            muted>
            New to Localsewa?
          </AppText>

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() =>
              navigation.navigate(
                'Register',
              )
            }>
            <AppText
              variant="label"
              color={theme.colors.primary}>
              Create account
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
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing[2],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    alignItems: 'center',
  },
});
