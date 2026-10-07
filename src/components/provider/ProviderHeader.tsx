import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useAppShell,
} from '../../app/AppShellProvider';
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

const logo =
  require('../../assets/branding/localsewa-mark.png');

export function ProviderHeader(): React.JSX.Element {
  const {
    providerTier,
  } = useAppShell();

  const {
    theme,
    mode,
  } = useAppTheme();

  const premium =
    mode ===
    'providerPremium';

  return (
    <SafeAreaView
      edges={[
        'top',
        'left',
        'right',
      ]}
      style={[
        styles.safeArea,
        {
          backgroundColor:
            premium
              ? theme.colors
                  .premiumPrimaryDeep ??
                theme.colors
                  .primary
              : theme.colors
                  .primary,
        },
      ]}>
      <View
        style={
          styles.header
        }>
        <Image
          source={logo}
          resizeMode="contain"
          style={
            styles.logo
          }
        />

        <View
          style={
            styles.workspace
          }>
          <AppText
            variant="overline"
            color={
              premium
                ? theme.colors
                    .premiumGoldSoft ??
                  '#F7E8BE'
                : '#CDE0D8'
            }
            numberOfLines={1}>
            PROVIDER WORKSPACE
          </AppText>

          <AppText
            variant="label"
            color="#FFFFFF"
            numberOfLines={1}>
            Manage your local business
          </AppText>
        </View>

        <View
          style={[
            styles.tier,
            {
              backgroundColor:
                premium
                  ? theme.colors
                      .premiumGoldSoft ??
                    '#F7E8BE'
                  : 'rgba(255,255,255,0.12)',
              borderColor:
                premium
                  ? theme.colors
                      .accent
                  : 'rgba(255,255,255,0.18)',
            },
          ]}>
          <AppIcon
            name={
              premium
                ? 'sparkles'
                : 'briefcase'
            }
            size={
              iconSize.xs
            }
            color={
              premium
                ? theme.colors
                    .premiumGoldStrong ??
                  '#B88A2B'
                : '#FFFFFF'
            }
          />

          <AppText
            variant="caption"
            color={
              premium
                ? theme.colors
                    .premiumGoldStrong ??
                  '#B88A2B'
                : '#FFFFFF'
            }>
            {providerTier ===
            'LOCALSEWA_PLUS'
              ? 'Localsewa+'
              : 'Standard'}
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      width: '100%',
    },
    header: {
      minHeight: 66,
      paddingHorizontal:
        spacing[4],
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: spacing[3],
    },
    logo: {
      width: 36,
      height: 36,
      borderRadius: 9,
      flexShrink: 0,
    },
    workspace: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    tier: {
      minHeight: 32,
      borderWidth: 1,
      borderRadius:
        radius.pill,
      paddingHorizontal:
        spacing[2],
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 5,
      flexShrink: 0,
    },
  });
