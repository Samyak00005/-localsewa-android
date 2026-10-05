import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '../../theme';
import { AppText } from './AppText';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'premium';

type BadgeProps = PropsWithChildren<{
  variant?: BadgeVariant;
}>;

export function Badge({
  children,
  variant = 'default',
}: BadgeProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const palette = getBadgePalette(variant, theme);

  return (
    <View style={[styles.base, { backgroundColor: palette.background }]}>
      <AppText variant="overline" color={palette.text} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

function getBadgePalette(
  variant: BadgeVariant,
  theme: ReturnType<typeof useAppTheme>['theme'],
) {
  switch (variant) {
    case 'success':
      return { background: '#DCFCE7', text: theme.colors.success };
    case 'warning':
      return { background: '#FEF3C7', text: theme.colors.warning };
    case 'error':
      return { background: '#FEE2E2', text: theme.colors.error };
    case 'info':
      return { background: '#DBEAFE', text: theme.colors.info };
    case 'premium':
      return {
        background: theme.colors.premiumGoldSoft ?? '#F7E8BE',
        text: theme.colors.premiumGoldStrong ?? '#B88A2B',
      };
    case 'default':
    default:
      return {
        background: theme.colors.surfaceMuted,
        text: theme.colors.textSecondary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  text: {
    letterSpacing: 0.6,
  },
});
