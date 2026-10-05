import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { useAuth } from '../../auth';
import { AppText, Avatar, Badge, Button, Card } from '../../components/ui';
import { spacing } from '../../theme';
import { WorkspacePlaceholderScreen } from '../shared/WorkspacePlaceholderScreen';

export function ProviderProfileScreen(): React.JSX.Element {
  const { enterCustomer } = useAppShell();
  const { user, logout } = useAuth();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    setError(null);

    try {
      await logout();
    } catch (logoutError) {
      setError(errorMessage(logoutError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspacePlaceholderScreen
      eyebrow="PROVIDER"
      title="Profile"
      description="Provider workspace access is based on your authenticated account roles."
    >
      <Card>
        <View style={styles.accountRow}>
          <Avatar initials={user?.full_name || 'LS'} size="lg" />

          <View style={styles.accountCopy}>
            <AppText variant="title">{user?.full_name || 'Provider'}</AppText>

            <Badge>PROVIDER</Badge>

            {user?.email ? (
              <AppText variant="caption" muted>
                {user.email}
              </AppText>
            ) : null}
          </View>
        </View>
      </Card>

      <Button
        label="Switch to Customer"
        variant="outline"
        onPress={enterCustomer}
        fullWidth
      />

      {error ? (
        <AppText variant="bodySmall" color="#B42318">
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
    gap: spacing[2],
  },
});
