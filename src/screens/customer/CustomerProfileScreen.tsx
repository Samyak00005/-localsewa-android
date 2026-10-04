import React, {
  useState,
} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  SettingsRow,
} from '../../components/account';
import {
  AlertBanner,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import {
  useAppShell,
} from '../../app/AppShellProvider';
import {useAuth} from '../../auth';
import {
  useCustomerProfile,
} from '../../hooks/useAccount';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  BottomTabScreenProps<
    CustomerTabParamList,
    'CustomerProfile'
  >;

export function CustomerProfileScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    canUseProvider,
    enterProvider,
  } = useAppShell();

  const {logout} =
    useAuth();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCustomerProfile();

  const [busy, setBusy] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState<string | null>(
      null,
    );

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  async function signOut() {
    setBusy(true);
    setLogoutError(null);

    try {
      await logout();
    } catch (
      signOutError
    ) {
      setLogoutError(
        errorMessage(
          signOutError,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={{
        backgroundColor:
          theme.colors.background,
      }}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}>
      <AppText variant="h1">
        Profile
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Manage your Localsewa account, location, security and support.
      </AppText>

      {isLoading ? (
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Skeleton
              width={76}
              height={76}
              radiusValue={38}
            />

            <View style={styles.profileCopy}>
              <Skeleton
                width="70%"
                height={22}
              />
              <Skeleton
                width="82%"
                height={14}
                style={styles.gap}
              />
              <Skeleton
                width="55%"
                height={12}
                style={styles.gap}
              />
            </View>
          </View>
        </Card>
      ) : error || !profile ? (
        <View style={styles.section}>
          <AlertBanner variant="error">
            {errorMessage(
              error ??
                new Error(
                  'Profile could not be loaded.',
                ),
            )}
          </AlertBanner>

          <Button
            label="Retry"
            loading={isRefetching}
            onPress={() => {
              refetch();
            }}
            fullWidth
          />
        </View>
      ) : (
        <>
          <Card style={styles.profileCard}>
            <View style={styles.profileRow}>
              {profile.profileImage ? (
                <Image
                  source={{
                    uri:
                      profile.profileImage,
                  }}
                  style={styles.image}
                />
              ) : (
                <Avatar
                  initials={
                    profile.fullName
                  }
                  size="lg"
                />
              )}

              <View style={styles.profileCopy}>
                <AppText variant="title">
                  {profile.fullName}
                </AppText>

                {profile.email ? (
                  <AppText
                    variant="bodySmall"
                    muted
                    style={styles.gap}>
                    {profile.email}
                  </AppText>
                ) : null}

                {profile.phone ? (
                  <AppText
                    variant="caption"
                    muted
                    style={styles.gap}>
                    {profile.phone}
                  </AppText>
                ) : null}

                <View style={styles.badges}>
                  {profile.emailVerified ? (
                    <Badge variant="success">
                      EMAIL VERIFIED
                    </Badge>
                  ) : null}

                  {profile.googleLinked ? (
                    <Badge>
                      GOOGLE LINKED
                    </Badge>
                  ) : null}
                </View>
              </View>
            </View>
          </Card>

          {profile.location ? (
            <Card style={styles.locationCard}>
              <AppText
                variant="caption"
                muted>
                Default service location
              </AppText>

              <AppText
                variant="label"
                style={styles.gap}>
                {profile.location}
              </AppText>
            </Card>
          ) : null}

          <View style={styles.section}>
            <AppText variant="title">
              Account
            </AppText>

            <View style={styles.rows}>
              <SettingsRow
                icon="userEdit"
                title="Edit profile"
                subtitle="Name, mobile and WhatsApp"
                onPress={() =>
                  stack?.navigate(
                    'EditCustomerProfile',
                  )
                }
              />

              <SettingsRow
                icon="mapPin"
                title="Default location"
                subtitle="Verify and save your usual service address"
                value={
                  profile.location
                    ? 'Saved'
                    : 'Not set'
                }
                onPress={() =>
                  stack?.navigate(
                    'DefaultLocation',
                  )
                }
              />

              <SettingsRow
                icon="shieldCheck"
                title="Account security"
                subtitle="Sessions, password and email security"
                onPress={() =>
                  stack?.navigate(
                    'AccountSecurity',
                  )
                }
              />
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="title">
              Support & legal
            </AppText>

            <View style={styles.rows}>
              <SettingsRow
                icon="help"
                title="Help & Support"
                subtitle="Common questions and support options"
                onPress={() =>
                  stack?.navigate(
                    'HelpSupport',
                  )
                }
              />

              <SettingsRow
                icon="fileText"
                title="Terms & Conditions"
                onPress={() =>
                  stack?.navigate(
                    'TermsConditions',
                  )
                }
              />

              <SettingsRow
                icon="shield"
                title="Privacy Policy"
                onPress={() =>
                  stack?.navigate(
                    'PrivacyPolicy',
                  )
                }
              />
            </View>
          </View>

          {canUseProvider ? (
            <View style={styles.section}>
              <Button
                label="Switch to Provider"
                icon="briefcase"
                onPress={() => {
                  enterProvider();
                }}
                fullWidth
              />
            </View>
          ) : null}

          <View style={styles.section}>
            <SettingsRow
              icon="trash"
              title="Delete account"
              subtitle="Review the 30-day account deletion lifecycle"
              danger
              onPress={() =>
                stack?.navigate(
                  'AccountDeletion',
                )
              }
            />
          </View>

          {logoutError ? (
            <View style={styles.section}>
              <AlertBanner variant="error">
                {logoutError}
              </AlertBanner>
            </View>
          ) : null}

          <View style={styles.section}>
            <Button
              label="Sign out"
              icon="lock"
              variant="secondary"
              loading={busy}
              onPress={signOut}
              fullWidth
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom:
      spacing[12],
  },
  subtitle: {
    marginTop:
      spacing[2],
  },
  profileCard: {
    marginTop:
      spacing[6],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  profileCopy: {
    flex: 1,
  },
  gap: {
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
  locationCard: {
    marginTop:
      spacing[4],
  },
  section: {
    marginTop:
      spacing[7],
    gap: spacing[3],
  },
  rows: {
    gap: spacing[2],
  },
});
