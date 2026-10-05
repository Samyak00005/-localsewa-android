import React, {
  useState,
} from 'react';
import {
  Image,
  Pressable,
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
  ProfileMenuRow,
} from '../../components/account';
import {
  AppIcon,
  AppIconName,
  iconSize,
} from '../../components/icons';
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
import {
  useAuth,
} from '../../auth';
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
  shadows,
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

  const {
    logout,
  } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCustomerProfile();

  const [
    signingOut,
    setSigningOut,
  ] =
    useState(false);

  const [
    logoutError,
    setLogoutError,
  ] =
    useState<string | null>(
      null,
    );

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
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
      setSigningOut(false);
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
      {isLoading ? (
        <ProfileSkeleton />
      ) : error ||
        !profile ? (
        <View
          style={
            styles.errorWrap
          }>
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
            loading={
              isRefetching
            }
            onPress={() =>
              refetch()
            }
            fullWidth
          />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
              shadows.sm,
            ]}>
            {profile.profileImage ? (
              <Image
                source={{
                  uri:
                    profile.profileImage,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <Avatar
                initials={
                  profile.fullName
                }
                size="lg"
              />
            )}

            <AppText
              variant="h2"
              numberOfLines={1}
              style={
                styles.profileName
              }>
              {
                profile.fullName
              }
            </AppText>

            {profile.email ? (
              <AppText
                variant="bodySmall"
                color={
                  theme.colors.textSecondary
                }
                numberOfLines={1}
                style={
                  styles.profileContact
                }>
                {profile.email}
              </AppText>
            ) : null}

            {profile.phone ? (
              <AppText
                variant="bodySmall"
                color={
                  theme.colors.textSecondary
                }
                numberOfLines={1}
                style={
                  styles.profileContact
                }>
                {profile.phone}
              </AppText>
            ) : null}

            <View
              style={
                styles.badges
              }>
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

            <Button
              label="Edit profile"
              icon="userEdit"
              variant="outline"
              onPress={() =>
                stack?.navigate(
                  'EditCustomerProfile',
                )
              }
              fullWidth
              style={
                styles.editButton
              }
            />
          </View>

          <ProfileSummary
            name={
              profile.fullName
            }
            email={
              profile.email
            }
            phone={
              profile.phone
            }
          />

          <ProfileSection
            title="Account & settings">
            <ProfileMenuRow
              icon="mapPin"
              title="Default location"
              subtitle={
                profile.location ??
                'Save your usual service address'
              }
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

            <ProfileMenuRow
              icon="shieldCheck"
              title="Account security"
              subtitle="Password, email, sessions and account deletion"
              onPress={() =>
                stack?.navigate(
                  'AccountSecurity',
                )
              }
            />
          </ProfileSection>

          {canUseProvider ? (
            <ProfileSection
              title="Provider workspace">
              <ProfileMenuRow
                icon="briefcase"
                title="Switch to Provider"
                subtitle="Open your provider dashboard and service tools"
                onPress={() => {
                  enterProvider();
                }}
              />
            </ProfileSection>
          ) : null}

          <ProfileSection
            title="Help & legal">
            <ProfileMenuRow
              icon="help"
              title="Help & Support"
              subtitle="Get help with your Localsewa account and bookings"
              onPress={() =>
                stack?.navigate(
                  'HelpSupport',
                )
              }
            />

            <ProfileMenuRow
              icon="fileText"
              title="Terms & Conditions"
              onPress={() =>
                stack?.navigate(
                  'TermsConditions',
                )
              }
            />

            <ProfileMenuRow
              icon="shield"
              title="Privacy Policy"
              onPress={() =>
                stack?.navigate(
                  'PrivacyPolicy',
                )
              }
            />
          </ProfileSection>

          {logoutError ? (
            <View
              style={
                styles.logoutError
              }>
              <AlertBanner variant="error">
                {logoutError}
              </AlertBanner>
            </View>
          ) : null}

          <View
            style={
              styles.accountActions
            }>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: signingOut,
              }}
              disabled={signingOut}
              onPress={signOut}
              style={({pressed}) => [
                styles.logoutAction,
                {
                  backgroundColor:
                    theme.colors.surfaceMuted,
                  borderColor:
                    theme.colors.border,
                  opacity:
                    signingOut
                      ? 0.55
                      : pressed
                        ? 0.78
                        : 1,
                },
              ]}>
              <View
                style={[
                  styles.logoutIcon,
                  {
                    backgroundColor:
                      theme.colors.surface,
                  },
                ]}>
                <AppIcon
                  name="logOut"
                  size={
                    iconSize.sm
                  }
                  color={
                    theme.colors.textSecondary
                  }
                />
              </View>

              <View
                style={
                  styles.logoutCopy
                }>
                <AppText
                  variant="label">
                  {signingOut
                    ? 'Logging out…'
                    : 'Log out'}
                </AppText>

                <AppText
                  variant="caption"
                  muted
                  style={
                    styles.logoutSubtitle
                  }>
                  Sign out from this device
                </AppText>
              </View>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ProfileSummary({
  name,
  email,
  phone,
}: {
  name: string;
  email: string | null;
  phone: string | null;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
        },
      ]}>
      <SummaryItem
        icon="user"
        label="Name"
        value={
          name ||
          'Not added'
        }
      />

      <View
        style={[
          styles.summaryDivider,
          {
            backgroundColor:
              theme.colors.border,
          },
        ]}
      />

      <SummaryItem
        icon="mail"
        label="Email"
        value={
          email ??
          'Not added'
        }
      />

      <View
        style={[
          styles.summaryDivider,
          {
            backgroundColor:
              theme.colors.border,
          },
        ]}
      />

      <SummaryItem
        icon="phone"
        label="Mobile"
        value={
          phone ??
          'Not added'
        }
      />
    </View>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: AppIconName;
  label: string;
  value: string;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <View
      style={
        styles.summaryItem
      }>
      <View
        style={[
          styles.summaryIcon,
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

      <View
        style={
          styles.summaryCopy
        }>
        <AppText
          variant="caption"
          muted>
          {label}
        </AppText>

        <AppText
          variant="label"
          color={
            theme.colors.text
          }
          numberOfLines={2}
          style={
            styles.summaryValue
          }>
          {value}
        </AppText>
      </View>
    </View>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
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
          theme.colors.textMuted
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
              theme.colors.border,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

function ProfileSkeleton(): React.JSX.Element {
  return (
    <View>
      <Card
        style={
          styles.skeletonProfile
        }>
        <View
          style={
            styles.skeletonCenter
          }>
          <Skeleton
            width={72}
            height={72}
            radiusValue={36}
          />

          <Skeleton
            width="55%"
            height={23}
            style={
              styles.skeletonGap
            }
          />

          <Skeleton
            width="72%"
            height={14}
            style={
              styles.skeletonSmallGap
            }
          />

          <Skeleton
            width="42%"
            height={14}
            style={
              styles.skeletonSmallGap
            }
          />

          <Skeleton
            width="100%"
            height={48}
            radiusValue={24}
            style={
              styles.skeletonLargeGap
            }
          />
        </View>
      </Card>

      <Card
        style={
          styles.skeletonSection
        }>
        <Skeleton
          width="100%"
          height={54}
          radiusValue={12}
        />

        <Skeleton
          width="100%"
          height={54}
          radiusValue={12}
          style={
            styles.skeletonGap
          }
        />

        <Skeleton
          width="100%"
          height={54}
          radiusValue={12}
          style={
            styles.skeletonGap
          }
        />
      </Card>
    </View>
  );
}

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[6],
      paddingBottom:
        spacing[12],
    },
    errorWrap: {
      marginTop:
        spacing[6],
      gap: spacing[3],
    },
    profileCard: {
      marginTop:
        spacing[2],
      borderWidth: 1,
      borderRadius: 24,
      padding:
        spacing[5],
      alignItems:
        'center',
    },
    profileImage: {
      width: 76,
      height: 76,
      borderRadius: 38,
    },
    profileName: {
      marginTop:
        spacing[3],
      textAlign: 'center',
    },
    profileContact: {
      marginTop:
        spacing[1],
      textAlign: 'center',
    },
    badges: {
      marginTop:
        spacing[3],
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: spacing[2],
    },
    editButton: {
      marginTop:
        spacing[4],
      borderRadius: 999,
    },
    summaryCard: {
      marginTop:
        spacing[4],
      borderWidth: 1,
      borderRadius:
        radius.xl,
      paddingHorizontal:
        spacing[4],
    },
    summaryItem: {
      minHeight: 66,
      paddingVertical:
        spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    summaryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    summaryCopy: {
      flex: 1,
      minWidth: 0,
    },
    summaryValue: {
      marginTop:
        spacing[1],
    },
    summaryDivider: {
      height:
        StyleSheet.hairlineWidth,
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
    logoutError: {
      marginTop:
        spacing[5],
    },
    accountActions: {
      marginTop:
        spacing[6],
      gap: spacing[3],
    },
    logoutAction: {
      minHeight: 70,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal:
        spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    logoutIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    logoutCopy: {
      flex: 1,
    },
    logoutSubtitle: {
      marginTop:
        spacing[1],
    },
    skeletonProfile: {
      marginTop:
        spacing[6],
      borderRadius: 24,
    },
    skeletonCenter: {
      alignItems:
        'center',
    },
    skeletonGap: {
      marginTop:
        spacing[3],
    },
    skeletonSmallGap: {
      marginTop:
        spacing[2],
    },
    skeletonLargeGap: {
      marginTop:
        spacing[4],
    },
    skeletonSection: {
      marginTop:
        spacing[5],
      borderRadius:
        radius.xl,
    },
  });
