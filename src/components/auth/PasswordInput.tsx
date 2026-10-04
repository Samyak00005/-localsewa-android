import React, {useState} from 'react';
import {Pressable, StyleSheet, TextInputProps} from 'react-native';

import {AppIcon, iconSize} from '../icons';
import {Input} from '../ui';
import {useAppTheme} from '../../theme';

type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry'> & {
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
  const [visible, setVisible] = useState(false);

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
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={4}
          onPress={() => setVisible(value => !value)}
          style={styles.toggle}>
          <AppIcon
            name={visible ? 'eyeOff' : 'eye'}
            size={iconSize.sm}
            color={theme.colors.textMuted}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
