import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {AppIcon, AppIconName, iconSize} from '../icons';
import {AppText} from '../ui';
import {radius, spacing, useAppTheme} from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  value?: string;
  danger?: boolean;
  icon?: AppIconName;
  onPress: () => void;
};

export function SettingsRow({
  title,
  subtitle,
  value,
  danger = false,
  icon,
  onPress,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();
  const accent = danger ? theme.colors.error : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: danger
                ? '#FEE2E2'
                : theme.colors.secondary,
            },
          ]}>
          <AppIcon name={icon} size={iconSize.sm} color={accent} />
        </View>
      ) : null}

      <View style={styles.copy}>
        <AppText
          variant="label"
          color={danger ? theme.colors.error : theme.colors.text}>
          {title}
        </AppText>

        {subtitle ? (
          <AppText variant="caption" muted style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={styles.right}>
        {value ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.value}>
            {value}
          </AppText>
        ) : null}

        <AppIcon
          name="chevronRight"
          size={iconSize.sm}
          color={danger ? theme.colors.error : theme.colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[1],
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    maxWidth: '44%',
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
