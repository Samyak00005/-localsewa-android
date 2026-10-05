import React from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { layout, radius, spacing, useAppTheme } from '../../theme';
import { AppText } from '../ui';

type GoogleSignInButtonProps = Omit<PressableProps, 'style'> & {
  label?: string;
};

export function GoogleSignInButton({
  label = 'Continue with Google',
  disabled = false,
  ...props
}: GoogleSignInButtonProps): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed
            ? theme.colors.surfaceMuted
            : theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={[styles.googleMark, { borderColor: theme.colors.border }]}>
        <AppText variant="title" color="#4285F4">
          G
        </AppText>
      </View>

      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouchTarget,
    width: '100%',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMark: {
    position: 'absolute',
    left: spacing[3],
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
