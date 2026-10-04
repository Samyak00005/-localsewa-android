import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../../auth';
import {
  AppText,
  Button,
  Card,
} from '../../components/ui';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type SessionRecoveryScreenProps = {
  message: string;
};

export function SessionRecoveryScreen({
  message,
}: SessionRecoveryScreenProps): React.JSX.Element {
  const {
    refreshSession,
    clearLocalSession,
  } = useAuth();
  const {theme} = useAppTheme();
  const [busy, setBusy] =
    useState(false);

  async function retry() {
    setBusy(true);
    try {
      await refreshSession();
    } finally {
      setBusy(false);
    }
  }

  async function useSignIn() {
    setBusy(true);
    try {
      await clearLocalSession();
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/branding/localsewa-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Card style={styles.card}>
          <AppText variant="h3">
            Unable to verify your session
          </AppText>

          <AppText
            variant="bodySmall"
            muted
            style={styles.message}>
            {message}
          </AppText>

          <AppText
            variant="caption"
            muted
            style={styles.note}>
            Your saved session has not been deleted. Retry when your
            connection is available.
          </AppText>

          <View style={styles.actions}>
            <Button
              label="Retry"
              loading={busy}
              onPress={retry}
              fullWidth
            />

            <Button
              label="Use sign in instead"
              variant="secondary"
              disabled={busy}
              onPress={useSignIn}
              fullWidth
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal:
      layout.screenHorizontal,
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    alignSelf: 'center',
    marginBottom: spacing[6],
  },
  card: {
    borderRadius: radius.xl,
  },
  message: {
    marginTop: spacing[3],
  },
  note: {
    marginTop: spacing[3],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[6],
  },
});
