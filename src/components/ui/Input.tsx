import React, {ReactNode} from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';

import {
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from '../../theme';
import {AppText} from './AppText';

type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Input({
  label,
  helperText,
  error,
  editable = true,
  leftAccessory,
  rightAccessory,
  style,
  ...props
}: InputProps): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText
          variant="label"
          style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputFrame,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: error
              ? theme.colors.error
              : theme.colors.border,
            opacity: editable ? 1 : 0.55,
          },
        ]}>
        {leftAccessory ? (
          <View style={styles.accessory}>
            {leftAccessory}
          </View>
        ) : null}

        <TextInput
          {...props}
          editable={editable}
          placeholderTextColor={
            theme.colors.textMuted
          }
          selectionColor={
            theme.colors.primary
          }
          style={[
            styles.input,
            {color: theme.colors.text},
            style,
          ]}
        />

        {rightAccessory ? (
          <View style={styles.accessory}>
            {rightAccessory}
          </View>
        ) : null}
      </View>

      {error ? (
        <AppText
          variant="caption"
          color={theme.colors.error}
          style={styles.message}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          muted
          style={styles.message}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: spacing[2],
  },
  inputFrame: {
    minHeight: layout.minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: layout.minTouchTarget - 2,
    paddingVertical: spacing[2],
    ...typography.body,
  },
  accessory: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing[1],
  },
});
