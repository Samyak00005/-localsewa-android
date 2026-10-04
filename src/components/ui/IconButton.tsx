import React, {ReactNode} from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from 'react-native';

import {layout, radius, useAppTheme} from '../../theme';

type IconButtonProps = Omit<PressableProps, 'style'> & {
  icon: ReactNode;
  accessibilityLabel: string;
  variant?: 'default' | 'filled';
};

export function IconButton({
  icon,
  accessibilityLabel,
  variant = 'default',
  disabled = false,
  ...props
}: IconButtonProps): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{disabled}}
      disabled={disabled}
      style={({pressed}) => [
        styles.base,
        {
          backgroundColor:
            variant === 'filled'
              ? theme.colors.primary
              : pressed
                ? theme.colors.surfaceMuted
                : theme.colors.surface,
          borderColor:
            variant === 'filled'
              ? theme.colors.primary
              : theme.colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      <View style={styles.icon}>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
