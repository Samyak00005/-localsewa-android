import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '../../theme';
import { AppText } from './AppText';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

type AlertBannerProps = PropsWithChildren<{
  variant?: AlertVariant;
}>;

export function AlertBanner({
  children,
  variant = 'info',
}: AlertBannerProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const palette =
    variant === 'error'
      ? {
          background: '#FEE2E2',
          border: theme.colors.error,
          text: theme.colors.error,
        }
      : variant === 'success'
      ? {
          background: '#DCFCE7',
          border: theme.colors.success,
          text: theme.colors.success,
        }
      : variant === 'warning'
      ? {
          background: '#FEF3C7',
          border: theme.colors.warning,
          text: theme.colors.warning,
        }
      : {
          background: '#DBEAFE',
          border: theme.colors.info,
          text: theme.colors.info,
        };

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <AppText variant="bodySmall" color={palette.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
});
