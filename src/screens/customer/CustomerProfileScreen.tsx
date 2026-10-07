import React, {
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
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
  Input,
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
  useUpdateCustomerProfile,
  useUploadProfileImage,
} from '../../hooks/useAccount';
import {
  pickProfilePhoto,
} from '../../native/profilePhotoPicker';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import {
  customerPalette,
  layout,
  radius,
  shadows,
  spacing,
  useAppTheme,
} from '../../theme';
import {
  validateFullName,
} from '../../utils/authValidation';

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

  const updateProfile =
    useUpdateCustomerProfile();

  const uploadPhoto =
    useUploadProfileImage();

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

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    fullName,
    setFullName,
  ] =
    useState('');


  const [
    profileMessage,
    setProfileMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    profileError,
    setProfileError,
  ] =
    useState<string | null>(
      null,
    );

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  function beginEditing() {
    if (!profile) {
      return;
    }

    setFullName(
      profile.fullName,
    );
    setProfileMessage(null);
    setProfileError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setProfileError(null);
  }

  async function saveProfile() {
    if (!profile) {
      return;
    }

    setProfileMessage(null);
    setProfileError(null);

    const nameCheck =
      validateFullName(
        fullName,
      );

    if (!nameCheck.valid) {
      setProfileError(
        nameCheck.message,
      );
      return;
    }


    try {
      await updateProfile.mutateAsync({
        fullName,
        phone:
          profile.phone ?? '',
        whatsapp:
          profile.whatsapp ??
          '',
      });

      setEditing(false);
      setProfileMessage(
        'Profile updated successfully.',
      );
    } catch (
      mutationError
    ) {
      setProfileError(
        errorMessage(
          mutationError,
        ),
      );
    }
  }

  async function changePhoto() {
    if (uploadPhoto.isPending) {
      return;
    }

    setProfileMessage(null);
    setProfileError(null);

    try {
      const image =
        await pickProfilePhoto();

      if (!image) {
        return;
      }

      await uploadPhoto.mutateAsync(
        image,
      );

      setProfileMessage(
        'Profile photo updated.',
      );
    } catch (
      photoError
    ) {
      setProfileError(
        errorMessage(
          photoError,
        ),
      );
    }
  }

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
      keyboardShouldPersistTaps="handled"
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
            <View
              style={
                styles.photoWrap
              }>
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

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                accessibilityState={{
                  busy:
                    uploadPhoto.isPending,
                }}
                disabled={
                  uploadPhoto.isPending
                }
                hitSlop={5}
                onPress={
                  changePhoto
                }
                style={({pressed}) => [
                  styles.photoEdit,
                  {
                    backgroundColor:
                      theme.colors.primary,
                    borderColor:
                      theme.colors.surface,
                    opacity:
                      pressed
                        ? 0.78
                        : 1,
                  },
                ]}>
                {uploadPhoto.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      theme.colors.onPrimary
                    }
                  />
                ) : (
                  <AppIcon
                    name="camera"
                    size={16}
                    color={
                      theme.colors.onPrimary
                    }
                  />
                )}
              </Pressable>
            </View>

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

            {!editing ? (
              <Button
                label="Edit profile"
                icon="userEdit"
                variant="outline"
                onPress={
                  beginEditing
                }
                fullWidth
                style={
                  styles.editButton
                }
              />
            ) : null}
          </View>

          {profileMessage ? (
            <View
              style={
                styles.inlineAlert
              }>
              <AlertBanner variant="success">
                {profileMessage}
              </AlertBanner>
            </View>
          ) : null}

          {profileError &&
          !editing ? (
            <View
              style={
                styles.inlineAlert
              }>
              <AlertBanner variant="error">
                {profileError}
              </AlertBanner>
            </View>
          ) : null}

          {editing ? (
            <ProfileEditCard
              fullName={
                fullName
              }
              email={
                profile.email
              }
              phone={
                profile.phone
              }
              error={
                profileError
              }
              saving={
                updateProfile.isPending
              }
              onFullNameChange={
                setFullName
              }
              onCancel={
                cancelEditing
              }
              onSave={
                saveProfile
              }
            />
          ) : (
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
          )}

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
              subtitle="Password, sessions and account deletion"
              onPress={() =>
                stack?.navigate(
                  'AccountSecurity',
                )
              }
            />
          </ProfileSection>


          {canUseProvider ? (
            <ProviderWorkspaceSwitchCard
              onPress={() => {
                enterProvider();
              }}
            />
          ) : null}

          <ProfileSection
            title="App settings">
            <ProfileMenuRow
              icon="fileText"
              title="App language"
              subtitle="Language used across Localsewa"
              value="English"
              onPress={() =>
                Alert.alert(
                  'App language',
                  'English is currently selected for the app.',
                )
              }
            />

            <ProfileMenuRow
              icon="sparkles"
              title="App theme"
              subtitle="Appearance used across the app"
              value="Light"
              onPress={() =>
                Alert.alert(
                  'App theme',
                  'Light theme is currently selected.',
                )
              }
            />

            <ProfileMenuRow
              icon="bell"
              title="Notifications"
              subtitle="View your in-app notifications"
              onPress={() =>
                stack?.navigate(
                  'Notifications',
                )
              }
            />
          </ProfileSection>

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

function ProfileEditCard({
  fullName,
  email,
  phone,
  error,
  saving,
  onFullNameChange,
  onCancel,
  onSave,
}: {
  fullName: string;
  email: string | null;
  phone: string | null;
  error: string | null;
  saving: boolean;
  onFullNameChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <View
      style={[
        styles.editCard,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
        },
      ]}>
      <View
        style={
          styles.editHeader
        }>
        <View>
          <AppText variant="title">
            Edit profile details
          </AppText>

          <AppText
            variant="caption"
            muted
            style={
              styles.editSubtitle
            }>
            Email and mobile stay linked to your account.
          </AppText>
        </View>
      </View>

      {error ? (
        <AlertBanner variant="error">
          {error}
        </AlertBanner>
      ) : null}

      <Input
        label="Full name"
        placeholder="Your name"
        value={fullName}
        onChangeText={
          onFullNameChange
        }
        editable={!saving}
        maxLength={80}
      />


      <View
        style={
          styles.lockedDetails
        }>
        <LockedDetail
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

        <LockedDetail
          icon="phone"
          label="Mobile"
          value={
            phone ??
            'Not added'
          }
        />
      </View>

      <View
        style={
          styles.editActions
        }>
        <Button
          label="Cancel"
          variant="secondary"
          disabled={saving}
          onPress={onCancel}
          style={
            styles.editAction
          }
        />

        <Button
          label="Save changes"
          loading={saving}
          onPress={onSave}
          style={
            styles.editAction
          }
        />
      </View>
    </View>
  );
}

function LockedDetail({
  icon,
  label,
  value,
}: {
  icon: 'mail' | 'phone';
  label: string;
  value: string;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <View
      style={
        styles.lockedRow
      }>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              theme.colors.surfaceMuted,
          },
        ]}>
        <AppIcon
          name={icon}
          size={
            iconSize.sm
          }
          color={
            theme.colors.textMuted
          }
        />
      </View>

      <View
        style={
          styles.summaryCopy
        }>
        <View
          style={
            styles.lockedLabelRow
          }>
          <AppText
            variant="caption"
            muted>
            {label}
          </AppText>

          <Badge>
            LINKED
          </Badge>
        </View>

        <AppText
          variant="label"
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

function ProviderWorkspaceSwitchCard({
  onPress,
}: {
  onPress: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.section}>
      <AppText
        variant="overline"
        color="#66776E">
        PROVIDER WORKSPACE
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch to Provider workspace"
        onPress={onPress}
        style={({pressed}) => [
          styles.providerSwitchCard,
          {
            opacity: pressed ? 0.92 : 1,
            transform: [
              {scale: pressed ? 0.995 : 1},
            ],
          },
        ]}>
        <View style={styles.providerSwitchBubbleTop} />
        <View style={styles.providerSwitchBubbleBottom} />
        <View style={styles.providerSwitchRing} />

        <View style={styles.providerSwitchRow}>
          <View style={styles.providerSwitchIcon}>
            <AppIcon
              name="briefcase"
              size={iconSize.sm}
              color={customerPalette.primary}
            />
          </View>

          <View style={styles.providerSwitchCopy}>
            <AppText
              variant="label"
              color="#FFFFFF">
              Switch to Provider
            </AppText>

            <AppText
              variant="caption"
              color="rgba(255,255,255,0.82)"
              numberOfLines={2}
              style={styles.providerSwitchSubtitle}>
              Open your provider dashboard and service tools
            </AppText>
          </View>

          <AppIcon
            name="chevronRight"
            size={iconSize.sm}
            color="#FFFFFF"
          />
        </View>
      </Pressable>
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
    photoWrap: {
      width: 88,
      height: 88,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    photoEdit: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent:
        'center',
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
    inlineAlert: {
      marginTop:
        spacing[3],
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
    editCard: {
      marginTop:
        spacing[4],
      borderWidth: 1,
      borderRadius:
        radius.xl,
      padding:
        spacing[4],
      gap: spacing[4],
    },
    editHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    editSubtitle: {
      marginTop:
        spacing[1],
    },
    lockedDetails: {
      borderRadius:
        radius.md,
      overflow: 'hidden',
    },
    lockedRow: {
      minHeight: 64,
      paddingVertical:
        spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    lockedLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: spacing[2],
    },
    editActions: {
      flexDirection: 'row',
      gap: spacing[3],
    },
    editAction: {
      flex: 1,
      borderRadius: 999,
    },
    section: {
      marginTop:
        spacing[6],
      gap: spacing[2],
    },
    providerSwitchCard: {
      minHeight: 84,
      borderRadius:
        radius.xl,
      backgroundColor:
        customerPalette.primary,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.14)',
    },
    providerSwitchBubbleTop: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      right: -58,
      top: -92,
      backgroundColor:
        'rgba(255,255,255,0.07)',
    },
    providerSwitchBubbleBottom: {
      position: 'absolute',
      width: 190,
      height: 190,
      borderRadius: 95,
      right: 8,
      bottom: -148,
      backgroundColor:
        'rgba(255,255,255,0.055)',
    },
    providerSwitchRing: {
      position: 'absolute',
      width: 104,
      height: 104,
      borderRadius: 52,
      right: 22,
      bottom: -38,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.15)',
      backgroundColor:
        'rgba(7,75,41,0.06)',
    },
    providerSwitchRow: {
      minHeight: 84,
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    providerSwitchIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        'rgba(255,255,255,0.92)',
      alignItems: 'center',
      justifyContent:
        'center',
    },
    providerSwitchCopy: {
      flex: 1,
      minWidth: 0,
    },
    providerSwitchSubtitle: {
      marginTop:
        spacing[1],
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
