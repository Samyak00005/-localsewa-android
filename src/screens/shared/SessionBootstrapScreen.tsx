import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Spinner } from '../../components/ui';
import { radius, spacing, useAppTheme } from '../../theme';

export function SessionBootstrapScreen(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/branding/localsewa-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <AppText variant="title" style={styles.title}>
          Localsewa
        </AppText>

        <View style={styles.loading}>
          <Spinner />
          <AppText variant="caption" muted>
            Checking your session…
          </AppText>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
  },
  title: {
    marginTop: spacing[4],
  },
  loading: {
    marginTop: spacing[6],
    alignItems: 'center',
    gap: spacing[2],
  },
});
