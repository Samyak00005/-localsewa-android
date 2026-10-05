import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { spacing, useAppTheme } from '../../theme';
import { AppText } from './AppText';

type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

export function AppSwitch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}: AppSwitchProps): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {label ? <AppText variant="label">{label}</AppText> : null}
        {description ? (
          <AppText
            variant="caption"
            muted
            style={label ? styles.description : undefined}
          >
            {description}
          </AppText>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.surfaceMuted,
          true: theme.colors.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  copy: {
    flex: 1,
  },
  description: {
    marginTop: spacing[1],
  },
});
