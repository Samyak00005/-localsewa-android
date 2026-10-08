import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, useAppTheme } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { AppText } from '../ui';

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

export function ProviderSubpageHeader({
  title,
  subtitle,
  onBack,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={({ pressed }) => [
          styles.back,
          {
            backgroundColor: theme.colors.surfaceMuted,
            opacity: pressed ? 0.72 : 1,
          },
        ]}
      >
        <AppIcon
          name="chevronLeft"
          size={iconSize.sm}
          color={theme.colors.primary}
        />
      </Pressable>

      <View style={styles.copy}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: 2,
  },
});
