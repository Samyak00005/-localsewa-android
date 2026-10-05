import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, shadows, spacing, useAppTheme } from '../../theme';

type CardProps = PropsWithChildren<{
  variant?: 'surface' | 'muted';
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({
  children,
  variant = 'surface',
  elevated = false,
  style,
}: CardProps): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor:
            variant === 'muted'
              ? theme.colors.surfaceMuted
              : theme.colors.surface,
          borderColor: theme.colors.border,
        },
        elevated && shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
});
