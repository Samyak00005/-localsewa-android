import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../theme';
import { AppText } from './AppText';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  source?: ImageSourcePropType;
  initials?: string;
  size?: AvatarSize;
};

const sizes: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 72,
};

export function Avatar({
  source,
  initials = 'LS',
  size = 'md',
}: AvatarProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const dimension = sizes[size];

  if (source) {
    return (
      <Image
        source={source}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: theme.colors.secondary,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText
        variant={size === 'lg' ? 'title' : 'label'}
        color={theme.colors.primary}
      >
        {initials.slice(0, 2).toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
