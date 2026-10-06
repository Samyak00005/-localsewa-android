import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { radius, spacing } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { AppText } from '../ui';

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CustomerLocationChip({
  label,
  onPress,
  style,
}: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Change service location"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        style,
        {
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <AppIcon name="mapPin" size={iconSize.xs} color="#FFFFFF" />

      <AppText
        variant="label"
        color="#FFFFFF"
        numberOfLines={1}
        style={styles.text}
      >
        {label}
      </AppText>

      <AppIcon name="chevronDown" size={iconSize.xs} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    minHeight: 32,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  text: {
    flexShrink: 1,
  },
});
