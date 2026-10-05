import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAuth } from '../../auth';
import { AuthScreenLayout, PasswordInput } from '../../components/auth';
import { AlertBanner, Button } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { spacing } from '../../theme';
import { validatePassword } from '../../utils/authValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation }: Props): React.JSX.Element {
  const { completePasswordReset } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);

    const check = validatePassword(password);

    if (!check.valid) {
      setError(check.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      await completePasswordReset(password, confirmPassword);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
            params: {
              notice:
                'Password updated successfully. Sign in with your new password.',
            },
          },
        ],
      });
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreenLayout
      eyebrow="NEW PASSWORD"
      title="Create a new password"
      description="Choose a strong password you haven't used for this account before."
    >
      <View style={styles.form}>
        {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

        <PasswordInput
          label="New password"
          placeholder="Enter new password"
          value={password}
          onChangeText={setPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={128}
          helperText="Use at least 8 characters."
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={128}
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Button
          label="Update password"
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
