import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { layout, radius, spacing, useAppTheme } from '../../theme';
import { AppIcon, AppIconName, iconSize } from '../icons';
import { AppText } from './AppText';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: AppIconName;
  iconPosition?: 'left' | 'right';
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const isDisabled = disabled || loading;
  const palette = getButtonPalette(variant, theme.colors);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor:
            pressed && !isDisabled
              ? palette.pressedBackground
              : palette.background,
          borderColor: palette.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? (
            <AppIcon name={icon} size={iconSize.sm} color={palette.text} />
          ) : null}

          <AppText variant="label" color={palette.text} style={styles.label}>
            {label}
          </AppText>

          {icon && iconPosition === 'right' ? (
            <AppIcon name={icon} size={iconSize.sm} color={palette.text} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function getButtonPalette(
  variant: ButtonVariant,
  colors: {
    primary: string;
    primaryPressed?: string;
    surface: string;
    border: string;
    text: string;
    error: string;
    onPrimary: string;
  },
) {
  switch (variant) {
    case 'secondary':
      return {
        background: colors.surface,
        pressedBackground: '#EEF2F0',
        border: colors.border,
        text: colors.text,
      };
    case 'outline':
      return {
        background: 'transparent',
        pressedBackground: '#EEF2F0',
        border: colors.primary,
        text: colors.primary,
      };
    case 'ghost':
      return {
        background: 'transparent',
        pressedBackground: '#EEF2F0',
        border: 'transparent',
        text: colors.primary,
      };
    case 'destructive':
      return {
        background: colors.error,
        pressedBackground: '#8F1D13',
        border: colors.error,
        text: colors.onPrimary,
      };
    default:
      return {
        background: colors.primary,
        pressedBackground: colors.primaryPressed ?? colors.primary,
        border: colors.primary,
        text: colors.onPrimary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  label: {
    textAlign: 'center',
  },
});
