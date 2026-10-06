import React, {
  useEffect,
} from 'react';
import {
  Modal,
  NativeModules,
  StyleSheet,
  View,
} from 'react-native';

import {
  customerTheme,
  providerStandardTheme,
  shadows,
  spacing,
} from '../../theme';
import {
  AppIcon,
  iconSize,
} from '../icons';
import {
  AppText,
} from '../ui';

export type WorkspaceSwitchTarget =
  | 'customer'
  | 'provider';

type Props = {
  visible: boolean;
  target: WorkspaceSwitchTarget;
};

export function WorkspaceSwitchModal({
  visible,
  target,
}: Props): React.JSX.Element {
  const providerTarget =
    target === 'provider';

  const customerColors =
    customerTheme.colors;

  const providerColors =
    providerStandardTheme.colors;

  const activeColor =
    providerTarget
      ? providerColors.primary
      : customerColors.primary;

  const activeSoft =
    providerTarget
      ? providerColors.secondary
      : customerColors.secondary;

  useEffect(() => {
    if (!visible) {
      return;
    }

    NativeModules.NotificationBackdrop
      ?.setBlurred?.(true);

    return () => {
      NativeModules.NotificationBackdrop
        ?.setBlurred?.(false);
    };
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent>
      <View
        style={
          styles.overlay
        }>
        <View
          style={[
            styles.card,
            shadows.md,
          ]}>
          <View
            style={
              styles.modeRow
            }>
            <View
              style={[
                styles.modeIcon,
                {
                  backgroundColor:
                    providerTarget
                      ? '#EEF3F1'
                      : activeSoft,
                },
              ]}>
              <AppIcon
                name="user"
                size={
                  iconSize.lg
                }
                color={
                  providerTarget
                    ? '#6F8178'
                    : activeColor
                }
              />
            </View>

            <View
              style={
                styles.connectorWrap
              }>
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor:
                      activeColor,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.modeIcon,
                {
                  backgroundColor:
                    providerTarget
                      ? activeSoft
                      : '#EEF3F1',
                },
              ]}>
              <AppIcon
                name="briefcase"
                size={
                  iconSize.lg
                }
                color={
                  providerTarget
                    ? activeColor
                    : '#75867D'
                }
              />
            </View>
          </View>

          <AppText
            variant="overline"
            color="#668679"
            style={
              styles.eyebrow
            }>
            SWITCHING WORKSPACE
          </AppText>

          <AppText
            variant="h2"
            style={
              styles.title
            }>
            {providerTarget
              ? 'Provider mode'
              : 'Customer mode'}
          </AppText>

          <AppText
            variant="bodySmall"
            color="#6E7E8E"
            style={
              styles.subtitle
            }>
            {providerTarget
              ? 'Preparing your business workspace…'
              : 'Preparing your customer workspace…'}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor:
        'rgba(7,24,17,0.28)',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      minHeight: 238,
      borderRadius: 28,
      backgroundColor:
        '#FFFFFF',
      paddingHorizontal:
        spacing[6],
      paddingVertical:
        spacing[6],
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    modeRow: {
      flexDirection: 'row',
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    modeIcon: {
      width: 62,
      height: 62,
      borderRadius: 18,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    connectorWrap: {
      width: 42,
      height: 2,
      justifyContent:
        'center',
    },
    connector: {
      width: '100%',
      height: 2,
    },
    eyebrow: {
      marginTop:
        spacing[5],
      letterSpacing: 2.2,
      textAlign: 'center',
    },
    title: {
      marginTop:
        spacing[2],
      textAlign: 'center',
    },
    subtitle: {
      marginTop:
        spacing[2],
      textAlign: 'center',
    },
  });
