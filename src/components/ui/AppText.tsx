import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { typography, useAppTheme } from '../../theme';

export type AppTextVariant = keyof typeof typography;

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: string;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  variant = 'body',
  color,
  muted = false,
  style,
  ...props
}: AppTextProps): React.JSX.Element {
  const { theme } = useAppTheme();

  const resolvedColor =
    color ?? (muted ? theme.colors.textSecondary : theme.colors.text);

  return (
    <Text
      {...props}
      style={[
        typography[variant] as TextStyle,
        { color: resolvedColor },
        style,
      ]}
    />
  );
}
