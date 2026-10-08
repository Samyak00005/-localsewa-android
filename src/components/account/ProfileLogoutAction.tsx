import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, iconSize } from '../icons';
import { AppText } from '../ui';
import { spacing, useAppTheme } from '../../theme';

type Props = {
  loading?: boolean;
  onPress: () => void;
};

export function ProfileLogoutAction({
  loading = false,
  onPress,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log out"
      accessibilityState={{ busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          opacity: loading ? 0.55 : pressed ? 0.78 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.icon,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <AppIcon
            name="logOut"
            size={iconSize.sm}
            color={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.copy}>
          <AppText variant="label">
            {loading ? 'Logging out…' : 'Log out'}
          </AppText>
          <AppText variant="caption" muted style={styles.subtitle}>
            Sign out from this device
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  subtitle: {
    marginTop: spacing[1],
  },
});
