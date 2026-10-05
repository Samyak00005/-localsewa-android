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
  spacing,
  useAppTheme,
} from '../../theme';

type Props = {
  icon: AppIconName;
  title: string;
  subtitle?: string;
  value?: string;
  danger?: boolean;
  onPress: () => void;
};

export function ProfileMenuRow({
  icon,
  title,
  subtitle,
  value,
  danger = false,
  onPress,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const accent =
    danger
      ? theme.colors.error
      : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        {
          backgroundColor:
            pressed
              ? theme.colors.surfaceMuted
              : theme.colors.surface,
          borderBottomColor:
            theme.colors.border,
        },
      ]}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor:
              danger
                ? '#FFF1F0'
                : theme.colors.secondary,
          },
        ]}>
        <AppIcon
          name={icon}
          size={
            iconSize.sm
          }
          color={accent}
        />
      </View>

      <View
        style={
          styles.copy
        }>
        <AppText
          variant="label"
          color={
            danger
              ? theme.colors.error
              : theme.colors.text
          }>
          {title}
        </AppText>

        {subtitle ? (
          <AppText
            variant="caption"
            muted
            numberOfLines={2}
            style={
              styles.subtitle
            }>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {value ? (
        <AppText
          variant="caption"
          muted
          numberOfLines={1}
          style={
            styles.value
          }>
          {value}
        </AppText>
      ) : null}

      <AppIcon
        name="chevronRight"
        size={
          iconSize.sm
        }
        color={
          danger
            ? theme.colors.error
            : theme.colors.textMuted
        }
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    row: {
      minHeight: 66,
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[3],
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[3],
      borderBottomWidth:
        StyleSheet.hairlineWidth,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    copy: {
      flex: 1,
      minWidth: 0,
    },
    subtitle: {
      marginTop:
        spacing[1],
    },
    value: {
      maxWidth: '28%',
      textAlign: 'right',
    },
  });
