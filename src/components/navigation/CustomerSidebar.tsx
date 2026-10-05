import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import { radius, spacing, useAppTheme } from '../../theme';
import { AppIcon, AppIconName, iconSize } from '../icons';
import { AppText } from '../ui';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function CustomerSidebar({
  visible,
  onClose,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<BottomTabNavigationProp<CustomerTabParamList>>();

  const stack =
    navigation.getParent<NativeStackNavigationProp<CustomerStackParamList>>();

  const screenWidth = Dimensions.get('window').width;

  const drawerWidth = Math.min(338, screenWidth * 0.86);

  const translateX = useRef(new Animated.Value(drawerWidth)).current;

  useEffect(() => {
    if (!visible) {
      translateX.setValue(drawerWidth);
      return;
    }

    Animated.timing(translateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [drawerWidth, translateX, visible]);

  function closeAnimated() {
    Animated.timing(translateX, {
      toValue: drawerWidth,
      duration: 180,
      useNativeDriver: true,
    }).start(() => onClose());
  }

  function openTab(tab: keyof CustomerTabParamList) {
    closeAnimated();
    setTimeout(() => navigation.navigate(tab), 180);
  }

  function openStack(
    route:
      | 'DefaultLocation'
      | 'HelpSupport'
      | 'TermsConditions'
      | 'PrivacyPolicy',
  ) {
    closeAnimated();
    setTimeout(() => stack?.navigate(route), 180);
  }

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={closeAnimated}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={closeAnimated} />

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, spacing[4]),
              backgroundColor: theme.colors.surface,
              transform: [
                {
                  translateX,
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View>
              <AppText variant="h2">Customer</AppText>

              <AppText variant="caption" muted style={styles.headerSub}>
                Localsewa account
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={closeAnimated}
              style={styles.close}
            >
              <AppIcon name="x" size={iconSize.md} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <SidebarItem
              icon="home"
              label="Home"
              onPress={() => openTab('CustomerHome')}
            />

            <SidebarItem
              icon="servicesGrid"
              label="All Services"
              onPress={() => openTab('CustomerServices')}
            />

            <SidebarItem
              icon="calendar"
              label="Bookings"
              onPress={() => openTab('CustomerBookings')}
            />

            <SidebarItem
              icon="bookmark"
              label="Saved Providers"
              onPress={() => openTab('CustomerSaved')}
            />

            <SidebarItem
              icon="user"
              label="Profile"
              onPress={() => openTab('CustomerProfile')}
            />

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.colors.border,
                },
              ]}
            />

            <AppText variant="overline" color={theme.colors.textMuted}>
              ACCOUNT & SUPPORT
            </AppText>

            <View style={styles.secondary}>
              <SidebarItem
                icon="mapPin"
                label="Default Location"
                onPress={() => openStack('DefaultLocation')}
              />

              <SidebarItem
                icon="help"
                label="Help & Support"
                onPress={() => openStack('HelpSupport')}
              />

              <SidebarItem
                icon="fileText"
                label="Terms & Conditions"
                onPress={() => openStack('TermsConditions')}
              />

              <SidebarItem
                icon="shield"
                label="Privacy Policy"
                onPress={() => openStack('PrivacyPolicy')}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SidebarItem({
  icon,
  label,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: pressed ? theme.colors.secondary : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.itemIcon,
          {
            backgroundColor: theme.colors.secondary,
          },
        ]}
      >
        <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      </View>

      <AppText variant="label" style={styles.itemLabel}>
        {label}
      </AppText>

      <AppIcon
        name="chevronRight"
        size={iconSize.sm}
        color={theme.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,20,14,0.42)',
  },
  drawer: {
    height: '100%',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {
      width: -6,
      height: 0,
    },
    elevation: 18,
  },
  header: {
    minHeight: 76,
    paddingHorizontal: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerSub: {
    marginTop: spacing[1],
  },
  close: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
  },
  item: {
    minHeight: 58,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[2],
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: spacing[5],
  },
  secondary: {
    marginTop: spacing[2],
  },
});
