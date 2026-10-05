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
            '#E1F4E9',
          borderColor:
            '#CAE9D7',
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
      minHeight: 132,
      borderRadius:
        radius.lg,
      borderWidth: 1,
      padding: spacing[3],
      overflow: 'hidden',
    },
    decor: {
      position: 'absolute',
      width: 86,
      height: 86,
      borderRadius: 43,
      right: -24,
      top: -22,
    },
    iconWrap: {
      position: 'absolute',
      right: spacing[3],
      top: spacing[3],
      width: 36,
      height: 36,
      borderRadius:
        radius.md,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    name: {
      marginTop:
        spacing[4],
      paddingRight: 30,
      minHeight: 48,
    },
    footer: {
      marginTop: 'auto',
      paddingTop:
        spacing[2],
      borderTopWidth: 1,
      flexDirection: 'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: spacing[2],
    },
  });
