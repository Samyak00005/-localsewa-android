import React, {
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  ProfileMenuRow,
} from '../../components/account';
import {
  AppIcon,
  iconSize,
} from '../../components/icons';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import {
  AlertBanner,
  AppText,
  Badge,
} from '../../components/ui';
import {
  useAuth,
} from '../../auth';
import {
  useCustomerProfile,
} from '../../hooks/useAccount';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  ChangePasswordScreen,
} from './ChangePasswordScreen';
import {
  SetPasswordScreen,
} from './SetPasswordScreen';
import {
  layout,
  radius,
  shadows,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'AccountSecurity'
  >;

export function AccountSecurityScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    logoutAll,
  } = useAuth();

  const {
    data: profile,
  } = useCustomerProfile();

  const [busy, setBusy] =
    useState(false);

  const [
    screenError,
    setScreenError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    passwordPopup,
    setPasswordPopup,
  ] =
    useState<
      'change' |
      'set' |
      null
    >(null);

  async function signOutEverywhere() {
    if (busy) {
      return;
    }

    setBusy(true);
    setScreenError(null);

    try {
      await logoutAll();
    } catch (
      mutationError
    ) {
      setScreenError(
        errorMessage(
          mutationError,
        ),
      );
      setBusy(false);
    }
  }

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}>
      <CustomerHeader
        routeName="CustomerProfile"
      />

      <ScrollView
        style={
          styles.scroll
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}>
        <AppText variant="h1">
          Account security
        </AppText>

        <AppText
          variant="body"
          muted
          style={
            styles.subtitle
          }>
          Manage your password, active sessions and account access.
        </AppText>

        {screenError ? (
          <View
            style={
              styles.alertWrap
            }>
            <AlertBanner variant="error">
              {screenError}
            </AlertBanner>
          </View>
        ) : null}

        <View
          style={[
            styles.identityCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
            shadows.sm,
          ]}>
          <View
            style={[
              styles.identityIcon,
              {
                backgroundColor:
                  theme.colors.secondary,
              },
            ]}>
            <AppIcon
              name="mail"
              size={
                iconSize.md
              }
              color={
                theme.colors.primary
              }
            />
          </View>

          <View
            style={
              styles.identityCopy
            }>
            <AppText
              variant="caption"
              muted>
              Account email
            </AppText>

            <AppText
              variant="label"
              numberOfLines={2}
              style={
                styles.email
              }>
              {profile?.email ??
                'No email available'}
            </AppText>

            <View
              style={
                styles.badges
              }>
              <Badge
                variant={
                  profile?.emailVerified
                    ? 'success'
                    : 'warning'
                }>
                {profile?.emailVerified
                  ? 'EMAIL VERIFIED'
                  : 'EMAIL NOT VERIFIED'}
              </Badge>

              {profile?.googleLinked ? (
                <Badge>
                  GOOGLE LINKED
                </Badge>
              ) : null}
            </View>
          </View>
        </View>

        <SecuritySection
          title="Password">
          <ProfileMenuRow
            icon="key"
            title="Change password"
            subtitle="Verify your current password and email OTP"
            onPress={() =>
              setPasswordPopup(
                'change',
              )
            }
          />

          {profile?.googleLinked ? (
            <ProfileMenuRow
              icon="lock"
              title="Set a password"
              subtitle="Create a password using verified email OTP"
              onPress={() =>
                setPasswordPopup(
                  'set',
                )
              }
            />
          ) : null}
        </SecuritySection>

        <View
          style={
            styles.section
          }>
          <AppText
            variant="overline"
            color={
              theme.colors.textMuted
            }>
            SESSIONS
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              busy,
            }}
            disabled={busy}
            onPress={
              signOutEverywhere
            }
            style={({pressed}) => [
              styles.sessionAction,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
                opacity:
                  busy
                    ? 0.55
                    : pressed
                      ? 0.8
                      : 1,
              },
            ]}>
            <View
              style={[
                styles.sessionIcon,
                {
                  backgroundColor:
                    '#FFF7E8',
                },
              ]}>
              <AppIcon
                name="logOut"
                size={
                  iconSize.sm
                }
                color="#9A6700"
              />
            </View>

            <View
              style={
                styles.sessionCopy
              }>
              <AppText
                variant="label">
                {busy
                  ? 'Signing out…'
                  : 'Sign out all devices'}
              </AppText>

              <AppText
                variant="caption"
                muted
                style={
                  styles.rowSubtitle
                }>
                Revoke every active Localsewa session, including this device
              </AppText>
            </View>
          </Pressable>
        </View>

        <SecuritySection
          title="Account"
          danger>
          <ProfileMenuRow
            icon="trash"
            title="Delete account"
            subtitle="Review the 30-day deletion process and verification steps"
            danger
            onPress={() =>
              navigation.navigate(
                'AccountDeletion',
              )
            }
          />
        </SecuritySection>

        <View
          style={
            styles.helpArea
          }>
          <AppText
            variant="caption"
            muted>
            Need help with account security?
          </AppText>

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() =>
              navigation.navigate(
                'HelpSupport',
              )
            }>
            <AppText
              variant="label"
              color={
                theme.colors.primary
              }
              style={
                styles.helpLink
              }>
              Get help
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={
          passwordPopup != null
        }
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setPasswordPopup(
            null,
          )
        }>
        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
          style={
            styles.modalOverlay
          }>
          <Pressable
            style={
              StyleSheet.absoluteFillObject
            }
            onPress={() =>
              setPasswordPopup(
                null,
              )
            }
          />

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  theme.colors.background,
              },
            ]}>
            <View
              style={
                styles.modalTop
              }>
              <View />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close password popup"
                onPress={() =>
                  setPasswordPopup(
                    null,
                  )
                }
                style={[
                  styles.modalClose,
                  {
                    backgroundColor:
                      theme.colors.surfaceMuted,
                  },
                ]}>
                <AppIcon
                  name="x"
                  size={
                    iconSize.sm
                  }
                  color={
                    theme.colors.textMuted
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.modalBody
              }>
              {passwordPopup ===
              'change' ? (
                <ChangePasswordScreen />
              ) : passwordPopup ===
                'set' ? (
                <SetPasswordScreen />
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CustomerDetailBottomBar
        activeRoute="CustomerProfile"
        onNavigate={tab =>
          navigation.navigate(
            'CustomerTabs',
            {
              screen: tab,
            },
          )
        }
      />
    </View>
  );
}

function SecuritySection({
  title,
  children,
  danger = false,
}: {
  title: string;
  children:
    React.ReactNode;
  danger?: boolean;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <View
      style={
        styles.section
      }>
      <AppText
        variant="overline"
        color={
          danger
            ? theme.colors.error
            : theme.colors.textMuted
        }>
        {title.toUpperCase()}
      </AppText>

      <View
        style={[
          styles.sectionShell,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              danger
                ? '#F3C6C2'
                : theme.colors.border,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[6],
      paddingBottom:
        spacing[10],
    },
    subtitle: {
      marginTop:
        spacing[2],
    },
    alertWrap: {
      marginTop:
        spacing[4],
    },
    identityCard: {
      marginTop:
        spacing[5],
      borderWidth: 1,
      borderRadius: 22,
      padding:
        spacing[4],
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    identityIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    identityCopy: {
      flex: 1,
      minWidth: 0,
    },
    email: {
      marginTop:
        spacing[1],
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
      marginTop:
        spacing[3],
    },
    section: {
      marginTop:
        spacing[6],
      gap: spacing[2],
    },
    sectionShell: {
      borderWidth: 1,
      borderRadius:
        radius.xl,
      overflow: 'hidden',
    },
    sessionAction: {
      minHeight: 76,
      borderWidth: 1,
      borderRadius:
        radius.xl,
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[3],
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[3],
    },
    sessionIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    sessionCopy: {
      flex: 1,
      minWidth: 0,
    },
    rowSubtitle: {
      marginTop:
        spacing[1],
    },
    helpArea: {
      marginTop:
        spacing[6],
      marginBottom:
        spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    helpLink: {
      textDecorationLine:
        'underline',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(7,24,17,0.46)',
      justifyContent:
        'center',
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[6],
    },
    modalCard: {
      width: '100%',
      maxWidth: 430,
      alignSelf: 'center',
      height: '86%',
      borderRadius: 24,
      overflow: 'hidden',
    },
    modalTop: {
      height: 52,
      paddingHorizontal:
        spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },
    modalClose: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    modalBody: {
      flex: 1,
      marginTop: -52,
      paddingTop: 44,
    },
  });
