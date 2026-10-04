import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppText,
} from '../ui';
import {
  spacing,
  useAppTheme,
} from '../../theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: SectionHeaderProps): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="title">
          {title}
        </AppText>

        {subtitle ? (
          <AppText
            variant="caption"
            muted
            style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}>
          <AppText
            variant="label"
            color={theme.colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[1],
  },
});
