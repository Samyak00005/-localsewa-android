import React, {useState} from 'react';
import {
  Pressable,
  TextInputProps,
} from 'react-native';

import {
  AppText,
  Input,
} from '../ui';
import {useAppTheme} from '../../theme';

type PasswordInputProps =
  Omit<
    TextInputProps,
    'secureTextEntry'
  > & {
    label: string;
    helperText?: string;
    error?: string;
  };

export function PasswordInput({
  label,
  helperText,
  error,
  ...props
}: PasswordInputProps): React.JSX.Element {
  const {theme} = useAppTheme();
  const [visible, setVisible] =
    useState(false);

  return (
    <Input
      {...props}
      label={label}
      helperText={helperText}
      error={error}
      secureTextEntry={!visible}
      autoCorrect={false}
      autoCapitalize="none"
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            visible
              ? 'Hide password'
              : 'Show password'
          }
          onPress={() =>
            setVisible(value => !value)
          }>
          <AppText
            variant="label"
            color={theme.colors.primary}>
            {visible ? 'Hide' : 'Show'}
          </AppText>
        </Pressable>
      }
    />
  );
}
