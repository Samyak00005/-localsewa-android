import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

import { radius, useAppTheme } from '../../theme';

type SkeletonProps = {
  width?: ViewStyle['width'];
  height?: number;
  radiusValue?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 16,
  radiusValue = radius.sm,
  style,
}: SkeletonProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radiusValue,
          backgroundColor: theme.colors.surfaceMuted,
          opacity,
        },
        style,
      ]}
    />
  );
}
