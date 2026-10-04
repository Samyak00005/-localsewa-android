import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useAppTheme} from '../../theme';

export function Divider(): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <View
      style={[
        styles.divider,
        {backgroundColor: theme.colors.border},
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
  },
});
