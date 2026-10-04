import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {
  errorMessage,
} from '../../api/apiClient';
import {useAppShell} from '../../app/AppShellProvider';
import {useAuth} from '../../auth';
import {
  AppText,
  Avatar,
  Button,
  Card,
} from '../../components/ui';
import {spacing} from '../../theme';
import {WorkspacePlaceholderScreen} from '../shared/WorkspacePlaceholderScreen';

export function CustomerProfileScreen(): React.JSX.Element {
  const {
    canUseProvider,
    enterProvider,
  } = useAppShell();
  const {
    user,
    logout,
  } = useAuth();

  const [busy, setBusy] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    setError(null);

    try {
      await logout();
    } catch (logoutError) {
      setError(
        errorMessage(logoutError),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspacePlaceholderScreen
      eyebrow="CUSTOMER"
      title="Profile"
      description="Your authenticated Localsewa account.">
      <Card>
        <View style={styles.accountRow}>
          <Avatar
            initials={
              user?.full_name || 'LS'
            }
            size="lg"
          />

          <View style={styles.accountCopy}>
            <AppText variant="title">
              {user?.full_name ||
                'Localsewa account'}
            </AppText>

            {user?.email ? (
              <AppText
                variant="bodySmall"
                muted>
                {user.email}
              </AppText>
            ) : null}

            {user?.phone ? (
              <AppText
                variant="caption"
                muted>
                {user.phone}
              </AppText>
            ) : null}
          </View>
        </View>
      </Card>

      {canUseProvider ? (
        <Button
          label="Switch to Provider"
          onPress={() => {
            enterProvider();
          }}
          fullWidth
        />
      ) : null}

      {error ? (
        <AppText
          variant="bodySmall"
          color="#B42318">
          {error}
        </AppText>
      ) : null}

      <Button
        label="Sign out"
        variant="secondary"
        loading={busy}
        onPress={signOut}
        fullWidth
      />
    </WorkspacePlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountCopy: {
    flex: 1,
    marginLeft: spacing[3],
    gap: spacing[1],
  },
});
