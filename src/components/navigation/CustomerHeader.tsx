import React, {
  useState,
} from 'react';
import {
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  useNavigation,
} from '@react-navigation/native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  AppIcon,
  AppIconName,
  iconSize,
} from '../icons';
import {
  AppText,
} from '../ui';
import {
  useNotifications,
} from '../../hooks/useNotifications';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import {
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props = {
  routeName:
    keyof CustomerTabParamList;
};

export function CustomerHeader({
  routeName,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const insets =
    useSafeAreaInsets();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const navigation =
    useNavigation<
      BottomTabNavigationProp<CustomerTabParamList>
    >();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const {
    data: notifications,
  } = useNotifications();

  const home =
    routeName ===
    'CustomerHome';

  const background =
    home
      ? '#108A4E'
      : theme.colors.surface;

  const iconColor =
    home
      ? '#FFFFFF'
      : theme.colors.primary;

  const unread =
    notifications?.unreadCount ??
    0;

  function openTab(
    tab:
      keyof CustomerTabParamList,
  ) {
    setMenuOpen(false);
    navigation.navigate(tab);
  }

  function openStack(
    route:
      | 'Notifications'
      | 'HelpSupport'
      | 'DefaultLocation',
  ) {
    setMenuOpen(false);
    stack?.navigate(route);
  }

  return (
    <>
      <View
        style={[
          styles.shell,
          {
            backgroundColor:
              background,
            paddingTop:
              insets.top,
            borderBottomColor:
              home
                ? 'rgba(255,255,255,0.16)'
                : theme.colors.border,
          },
        ]}>
        <StatusBar
          barStyle={
            home
              ? 'light-content'
              : 'dark-content'
          }
          backgroundColor={
            background
          }
        />

        <View
          style={styles.header}>
          <View
            style={[
              styles.markWrap,
              {
                backgroundColor:
                  '#FFFFFF',
              },
            ]}>
            <Image
              source={require('../../assets/branding/localsewa-mark.png')}
              resizeMode="cover"
              style={styles.mark}
            />
          </View>

          <View
            style={
              styles.actions
            }>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unread > 0
                  ? `Notifications, ${unread} unread`
                  : 'Notifications'
              }
              onPress={() =>
                openStack(
                  'Notifications',
                )
              }
              style={({pressed}) => [
                styles.iconButton,
                {
                  backgroundColor:
                    home
                      ? 'rgba(255,255,255,0.08)'
                      : theme.colors.secondary,
                  borderColor:
                    home
                      ? 'rgba(255,255,255,0.18)'
                      : theme.colors.border,
                  opacity:
                    pressed
                      ? 0.78
                      : 1,
                },
              ]}>
              <AppIcon
                name="bell"
                size={
                  iconSize.sm
                }
                color={
                  iconColor
                }
              />

              {unread > 0 ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        theme.colors.error,
                      borderColor:
                        home
                          ? '#108A4E'
                          : theme.colors.surface,
                    },
                  ]}>
                  <AppText
                    variant="overline"
                    color="#FFFFFF">
                    {unread > 99
                      ? '99+'
                      : String(
                          unread,
                        )}
                  </AppText>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              onPress={() =>
                setMenuOpen(
                  true,
                )
              }
              style={({pressed}) => [
                styles.iconButton,
                {
                  backgroundColor:
                    home
                      ? 'rgba(255,255,255,0.08)'
                      : theme.colors.secondary,
                  borderColor:
                    home
                      ? 'rgba(255,255,255,0.18)'
                      : theme.colors.border,
                  opacity:
                    pressed
                      ? 0.78
                      : 1,
                },
              ]}>
              <AppIcon
                name="menu"
                size={
                  iconSize.md
                }
                color={
                  iconColor
                }
              />
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={menuOpen}
        statusBarTranslucent
        onRequestClose={() =>
          setMenuOpen(false)
        }>
        <TouchableWithoutFeedback
          onPress={() =>
            setMenuOpen(false)
          }>
          <View
            style={
              styles.overlay
            }>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menu,
                  {
                    backgroundColor:
                      theme.colors.surface,
                    borderColor:
                      theme.colors.border,
                    top:
                      insets.top +
                      54,
                  },
                ]}>
                <AppText
                  variant="overline"
                  color={
                    theme.colors.primary
                  }>
                  QUICK MENU
                </AppText>

                <View
                  style={
                    styles.menuItems
                  }>
                  <MenuItem
                    icon="grid"
                    label="All Services"
                    onPress={() =>
                      openTab(
                        'CustomerServices',
                      )
                    }
                  />

                  <MenuItem
                    icon="calendar"
                    label="Bookings"
                    onPress={() =>
                      openTab(
                        'CustomerBookings',
                      )
                    }
                  />

                  <MenuItem
                    icon="bookmark"
                    label="Saved Providers"
                    onPress={() =>
                      openTab(
                        'CustomerSaved',
                      )
                    }
                  />

                  <MenuItem
                    icon="mapPin"
                    label="Default Location"
                    onPress={() =>
                      openStack(
                        'DefaultLocation',
                      )
                    }
                  />

                  <MenuItem
                    icon="help"
                    label="Help & Support"
                    onPress={() =>
                      openStack(
                        'HelpSupport',
                      )
                    }
                  />

                  <MenuItem
                    icon="user"
                    label="Profile"
                    onPress={() =>
                      openTab(
                        'CustomerProfile',
                      )
                    }
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.menuItem,
        {
          backgroundColor:
            pressed
              ? theme.colors.secondary
              : theme.colors.surface,
        },
      ]}>
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor:
              theme.colors.secondary,
          },
        ]}>
        <AppIcon
          name={icon}
          size={
            iconSize.sm
          }
          color={
            theme.colors.primary
          }
        />
      </View>

      <AppText
        variant="label"
        style={
          styles.menuLabel
        }>
        {label}
      </AppText>

      <AppIcon
        name="chevronRight"
        size={
          iconSize.sm
        }
        color={
          theme.colors
            .textMuted
        }
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    shell: {
      borderBottomWidth: 1,
    },
    header: {
      height: 52,
      paddingHorizontal:
        spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },
    markWrap: {
      width: 40,
      height: 40,
      borderRadius:
        radius.md,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent:
        'center',
    },
    mark: {
      width: 40,
      height: 40,
    },
    actions: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[2],
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    badge: {
      position: 'absolute',
      top: -3,
      right: -4,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 4,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    overlay: {
      flex: 1,
      backgroundColor:
        'rgba(5,20,14,0.28)',
    },
    menu: {
      position: 'absolute',
      right: spacing[3],
      width: 252,
      borderWidth: 1,
      borderRadius:
        radius.xl,
      padding: spacing[3],
      shadowColor:
        '#000000',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 8,
    },
    menuItems: {
      marginTop:
        spacing[2],
      gap: spacing[1],
    },
    menuItem: {
      minHeight: 52,
      borderRadius:
        radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      paddingHorizontal:
        spacing[2],
    },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius:
        radius.md,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    menuLabel: {
      flex: 1,
    },
  });
