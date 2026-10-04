import React from 'react';
import {ActivityIndicator} from 'react-native';

import {useAppTheme} from '../../theme';

type SpinnerProps = {
  size?: 'small' | 'large';
  color?: string;
};

export function Spinner({
  size = 'small',
  color,
}: SpinnerProps): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <ActivityIndicator
      size={size}
      color={color ?? theme.colors.primary}
    />
  );
}
