import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppIcon,
  AppIconName,
  iconSize,
} from '../icons';
import {
  AppText,
} from '../ui';
import {
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props = {
  name: string;
  providerCount: number;
  selected?: boolean;
  onPress: () => void;
};

function categoryIcon(
  name: string,
): AppIconName {
  const value =
    name.toLowerCase();

  if (
    value.includes(
      'electric',
    )
  ) {
    return 'zap';
  }

  if (
    value.includes(
      'clean',
    ) ||
    value.includes(
      'washing',
    )
  ) {
    return 'sparkles';
  }

  if (
    value.includes(
      'carpenter',
    ) ||
    value.includes(
      'wood',
    )
  ) {
    return 'hammer';
  }

  if (
    value.includes(
      'plumb',
    ) ||
    value.includes(
      'repair',
    ) ||
    value.includes(
      'mechanic',
    )
  ) {
    return 'wrench';
  }

  return 'grid';
}

export function HomeServiceCard({
  name,
  providerCount,
  selected = false,
  onPress,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const available =
    providerCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor:
            selected
              ? '#D9F1E3'
              : '#E1F4E9',
          borderColor:
            selected
              ? theme.colors.primary
              : '#CAE9D7',
          borderWidth:
            selected
              ? 1.5
              : 1,
          opacity:
            pressed
              ? 0.9
              : 1,
        },
      ]}>
      <View
        style={[
          styles.decor,
          {
            backgroundColor:
              '#D2EDDE',
          },
        ]}
      />

      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor:
              '#FFFFFF',
          },
        ]}>
        <AppIcon
          name={
            categoryIcon(
              name,
            )
          }
          size={
            iconSize.sm
          }
          color={
            theme.colors.primary
          }
        />
      </View>

      <AppText
        variant="overline"
        color={
          theme.colors.primary
        }>
        LOCAL SERVICES
      </AppText>

      <AppText
        variant="title"
        numberOfLines={2}
        style={styles.name}>
        {name}
      </AppText>

      <View
        style={[
          styles.footer,
          {
            borderTopColor:
              '#BFE2CC',
          },
        ]}>
        <AppText
          variant="caption"
          color={
            available
              ? theme.colors.primary
              : theme.colors
                  .textMuted
          }>
          {available
            ? `${providerCount} ${providerCount === 1 ? 'provider' : 'providers'}`
            : 'Available soon'}
        </AppText>

        <AppIcon
          name="arrowRight"
          size={
            iconSize.xs
          }
          color={
            available
              ? theme.colors.primary
              : theme.colors
                  .textMuted
          }
        />
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 0,
      aspectRatio: 4 / 3,
      borderRadius:
        radius.lg,
      borderWidth: 1,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      overflow: 'hidden',
    },
    decor: {
      position: 'absolute',
      width: 76,
      height: 76,
      borderRadius: 38,
      right: -22,
      top: -24,
    },
    iconWrap: {
      position: 'absolute',
      right: spacing[3],
      top: spacing[3],
      width: 34,
      height: 34,
      borderRadius:
        radius.md,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    name: {
      marginTop:
        spacing[2],
      paddingRight: 28,
      minHeight: 38,
    },
    footer: {
      marginTop: 'auto',
      paddingTop:
        spacing[1],
      borderTopWidth: 1,
      flexDirection: 'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: spacing[2],
    },
  });
