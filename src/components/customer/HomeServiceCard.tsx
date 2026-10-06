import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppIcon,
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
import {
  ServiceCategoryIcon,
} from './ServiceCategoryIcon';

type Props = {
  slug?: string;
  name: string;
  providerCount: number;
  selected?: boolean;
  onPress: () => void;
};

export function HomeServiceCard({
  slug,
  name,
  providerCount,
  selected = false,
  onPress,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const available =
    providerCount > 0;

  const iconColor =
    '#2B6549';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor:
            selected
              ? '#E2F3E7'
              : '#EDF8F1',
          borderColor:
            selected
              ? '#86C79E'
              : '#CAE4D3',
          borderWidth:
            selected
              ? 1.5
              : 1,
          opacity:
            pressed
              ? 0.88
              : 1,
        },
      ]}>
      <View
        pointerEvents="none"
        style={[
          styles.softShape,
          {
            backgroundColor:
              selected
                ? '#CFE9D8'
                : '#DCEFE3',
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.softRing,
          {
            borderColor:
              selected
                ? '#AFCFBB'
                : '#BDDCC8',
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={
          styles.iconAnchor
        }>
        <ServiceCategoryIcon
          slug={slug}
          name={name}
          size={35}
          color={iconColor}
        />
      </View>

      <AppText
        variant="title"
        numberOfLines={2}
        style={
          styles.name
        }>
        {name}
      </AppText>

      <View
        style={[
          styles.footer,
          {
            borderTopColor:
              '#DDEDE3',
          },
        ]}>
        <AppText
          variant="caption"
          color={
            available
              ? theme.colors.primary
              : '#667A6F'
          }>
          {available
            ? `${providerCount} ${providerCount === 1 ? 'provider' : 'providers'}`
            : 'Available soon'}
        </AppText>

        <AppIcon
          name="arrowRight"
          size={iconSize.xs}
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
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[3],
      justifyContent:
        'space-between',
      position:
        'relative',
      overflow:
        'hidden',
    },
    softShape: {
      position:
        'absolute',
      width: 88,
      height: 88,
      borderRadius: 44,
      right: -28,
      top: '50%',
      transform: [
        {
          translateY: -44,
        },
      ],
      opacity: 0.78,
    },
    softRing: {
      position:
        'absolute',
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 1,
      right: -17,
      top: '50%',
      transform: [
        {
          translateY: -29,
        },
      ],
      opacity: 0.46,
    },
    iconAnchor: {
      position:
        'absolute',
      right: 15,
      top: '50%',
      transform: [
        {
          translateY: -18,
        },
      ],
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    name: {
      maxWidth: '66%',
      paddingRight:
        spacing[1],
    },
    footer: {
      paddingTop:
        spacing[2],
      borderTopWidth:
        StyleSheet.hairlineWidth,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: spacing[2],
    },
  });
