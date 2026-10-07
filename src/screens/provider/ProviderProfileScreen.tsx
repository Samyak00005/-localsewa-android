import {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import React, {
  useState,
} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  useAppShell,
} from '../../app/AppShellProvider';
import {
  useAuth,
} from '../../auth';
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
  useProviderDashboard,
} from '../../hooks/useProviderWorkspace';
import {
  ProviderTabParamList,
} from '../../navigation/types';
import {
  API_ORIGIN,
} from '../../api/apiClient';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  BottomTabScreenProps<
    ProviderTabParamList,
    'ProviderProfile'
  >;

function mediaUrl(
  value?: string | null,
): string | undefined {
  const path =
    value?.trim();

  if (!path) {
    return undefined;
  }

  if (
    /^https?:\/\//i.test(
      path,
    )
  ) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(
    /^\/+/,
    '',
  )}`;
}

export function ProviderProfileScreen({
  navigation,
}: Props): React.JSX.Element {
  const {
    theme,
    mode,
  } = useAppTheme();

  const {
    providerTier,
    enterCustomer,
  } = useAppShell();

  const {
    user,
    logout,
  } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } =
    useProviderDashboard();

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    logoutError,
    setLogoutError,
  ] =
    useState<string | null>(
      null,
    );

  const premium =
    mode ===
    'providerPremium';

  const profile =
    data?.profile;

  const profileImage =
    profile?.profileImageUrl ??
    mediaUrl(
      user?.profile_image,
    );

  const displayName =
    profile?.businessName ||
    user?.full_name ||
    'Provider';

  async function signOut() {
    setBusy(true);
    setLogoutError(
      null,
    );

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
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors
              .background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }>
      <AppText variant="h1">
        Profile
      </AppText>

      <AppText
        variant="body"
        muted
        style={
          styles.description
        }>
        Manage your provider identity, workspace and account.
      </AppText>

      {isLoading ? (
        <ProfileSkeleton />
      ) : error ? (
        <View
          style={
            styles.errorBlock
          }>
          <AlertBanner variant="error">
            {errorMessage(
              error,
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
          <Card
            style={[
              styles.identityCard,
              premium && {
                borderColor:
                  theme.colors
                    .accent,
              },
            ]}>
            <View
              style={
                styles.identityRow
              }>
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={
                    styles.avatar
                  }
                />
              ) : (
                <Avatar
                  initials={
                    displayName
                  }
                  size="lg"
                />
              )}

              <View
                style={
                  styles.identityCopy
                }>
                <View
                  style={
                    styles.nameRow
                  }>
                  <AppText
                    variant="h2"
                    numberOfLines={
                      2
                    }
                    style={
                      styles.name
                    }>
                    {displayName}
                  </AppText>

                  {providerTier ===
                  'LOCALSEWA_PLUS' ? (
                    <Badge variant="premium">
                      LOCALSEWA+
                    </Badge>
                  ) : null}
                </View>

                {profile?.category ? (
                  <AppText
                    variant="label"
                    color={
                      theme.colors
                        .primary
                    }
                    style={
                      styles.smallGap
                    }>
                    {
                      profile.category
                    }
                  </AppText>
                ) : null}

                {profile?.location ? (
                  <View
                    style={
                      styles.metaRow
                    }>
                    <AppIcon
                      name="mapPin"
                      size={
                        iconSize.xs
                      }
                      color={
                        theme.colors
                          .textMuted
                      }
                    />

                    <AppText
                      variant="caption"
                      muted
                      numberOfLines={
                        2
                      }
                      style={
                        styles.flex
                      }>
                      {
                        profile.location
                      }
                    </AppText>
                  </View>
                ) : null}

                {profile?.available !=
                null ? (
                  <View
                    style={
                      styles.statusRow
                    }>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            profile.available
                              ? theme.colors
                                  .success
                              : theme.colors
                                  .disabled,
                        },
                      ]}
                    />

                    <AppText
                      variant="caption"
                      color={
                        profile.available
                          ? theme.colors
                              .success
                          : theme.colors
                              .textMuted
                      }>
                      {profile.available
                        ? 'Available for requests'
                        : 'Currently unavailable'}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>

            <View
              style={
                styles.stats
              }>
              <ProviderStat
                icon="star"
                value={
                  profile?.averageRating ==
                  null
                    ? 'New'
                    : profile.averageRating.toFixed(
                        1,
                      )
                }
                label="Rating"
              />

              <ProviderStat
                icon="message"
                value={String(
                  profile?.reviewCount ??
                    0,
                )}
                label="Reviews"
              />

              <ProviderStat
                icon="briefcase"
                value={
                  profile?.experienceYears !=
                  null
                    ? `${profile.experienceYears} yr`
                    : '—'
                }
                label="Experience"
              />
            </View>

            {profile?.description ? (
              <View
                style={[
                  styles.about,
                  {
                    borderTopColor:
                      theme.colors
                        .border,
                  },
                ]}>
                <AppText variant="title">
                  About
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  style={
                    styles.aboutText
                  }>
                  {
                    profile.description
                  }
                </AppText>
              </View>
            ) : null}
          </Card>

          <ProviderSection
            title="Provider workspace">
            <ProviderMenuRow
              icon="wrench"
              title="Services"
              subtitle="Manage services, descriptions and pricing"
              onPress={() =>
                navigation.navigate(
                  'ProviderServices',
                )
              }
            />

            <ProviderMenuRow
              icon="star"
              title="Reviews"
              subtitle="See ratings and customer feedback"
              onPress={() =>
                navigation.navigate(
                  'ProviderReviews',
                )
              }
            />

            <ProviderMenuRow
              icon="sparkles"
              title="Localsewa+"
              subtitle={
                providerTier ===
                'LOCALSEWA_PLUS'
                  ? 'Premium provider benefits are active'
                  : 'Standard provider plan'
              }
              value={
                providerTier ===
                'LOCALSEWA_PLUS'
                  ? 'Active'
                  : 'Standard'
              }
              onPress={() =>
                Alert.alert(
                  'Localsewa+',
                  'Membership management will be added in the next Provider phase.',
                )
              }
            />
          </ProviderSection>

          <ProviderSection
            title="Account & support">
            <ProviderMenuRow
              icon="shield"
              title="Account security"
              subtitle="Password, sessions and account security"
              value="Next"
              onPress={() =>
                Alert.alert(
                  'Account security',
                  'The shared Account Security flow will be connected to the Provider workspace in the next refinement pass.',
                )
              }
            />

            <ProviderMenuRow
              icon="help"
              title="Help & support"
              subtitle="Get help with your provider workspace"
              value="Next"
              onPress={() =>
                Alert.alert(
                  'Help & support',
                  'Provider Help & Support will be connected after the lightweight Provider pages are approved.',
                )
              }
            />
          </ProviderSection>

          <View
            style={
              styles.roleSection
            }>
            <AppText
              variant="overline"
              muted>
              WORKSPACE
            </AppText>

            <Button
              label="Switch to Customer"
              variant="outline"
              icon="user"
              onPress={
                enterCustomer
              }
              fullWidth
              style={
                styles.switchButton
              }
            />
          </View>

          {logoutError ? (
            <AlertBanner variant="error">
              {logoutError}
            </AlertBanner>
          ) : null}

          <Button
            label="Sign out"
            variant="destructive"
            icon="logOut"
            loading={busy}
            onPress={signOut}
            fullWidth
          />
        </>
      )}
    </ScrollView>
  );
}

function ProviderSection({
  title,
  children,
}: React.PropsWithChildren<{
  title: string;
}>): React.JSX.Element {
  return (
    <View
      style={
        styles.section
      }>
      <AppText
        variant="overline"
        muted>
        {title.toUpperCase()}
      </AppText>

      <Card
        style={
          styles.menuCard
        }>
        {children}
      </Card>
    </View>
  );
}

function ProviderMenuRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
}: {
  icon: AppIconName;
  title: string;
  subtitle: string;
  value?: string;
  onPress: () => void;
}): React.JSX.Element {
  const {
    theme,
  } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.menuRow,
        {
          opacity:
            pressed
              ? 0.7
              : 1,
        },
      ]}>
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor:
              theme.colors
                .secondary,
          },
        ]}>
        <AppIcon
          name={icon}
          size={
            iconSize.sm
          }
          color={
            theme.colors
              .primary
          }
        />
      </View>

      <View
        style={
          styles.menuCopy
        }>
        <AppText variant="label">
          {title}
        </AppText>

        <AppText
          variant="caption"
          muted
          style={
            styles.tinyGap
          }>
          {subtitle}
        </AppText>
      </View>

      {value ? (
        <AppText
          variant="caption"
          color={
            theme.colors
              .primary
          }>
          {value}
        </AppText>
      ) : null}

      <AppIcon
        name="chevronRight"
        size={
          iconSize.xs
        }
        color={
          theme.colors
            .textMuted
        }
      />
    </Pressable>
  );
}

function ProviderStat({
  icon,
  value,
  label,
}: {
  icon: AppIconName;
  value: string;
  label: string;
}): React.JSX.Element {
  const {
    theme,
  } = useAppTheme();

  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor:
            theme.colors
              .surfaceMuted,
        },
      ]}>
      <AppIcon
        name={icon}
        size={16}
        color={
          theme.colors.primary
        }
      />

      <AppText
        variant="label"
        style={
          styles.statValue
        }>
        {value}
      </AppText>

      <AppText
        variant="caption"
        muted>
        {label}
      </AppText>
    </View>
  );
}

function ProfileSkeleton(): React.JSX.Element {
  return (
    <Card
      style={
        styles.identityCard
      }>
      <View
        style={
          styles.identityRow
        }>
        <Skeleton
          width={72}
          height={72}
          radiusValue={36}
        />

        <View
          style={
            styles.skeletonCopy
          }>
          <Skeleton
            width="72%"
            height={24}
          />
          <Skeleton
            width="42%"
            height={14}
            style={
              styles.smallGap
            }
          />
          <Skeleton
            width="58%"
            height={12}
            style={
              styles.smallGap
            }
          />
        </View>
      </View>

      <View
        style={
          styles.stats
        }>
        {[0, 1, 2].map(
          item => (
            <Skeleton
              key={item}
              width="31%"
              height={72}
              radiusValue={14}
            />
          ),
        )}
      </View>
    </Card>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[5],
      paddingBottom:
        spacing[12],
    },
    description: {
      marginTop:
        spacing[2],
    },
    errorBlock: {
      marginTop:
        spacing[5],
      gap: spacing[3],
    },
    identityCard: {
      marginTop:
        spacing[5],
      borderRadius:
        radius.xl,
    },
    identityRow: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      flexShrink: 0,
    },
    identityCopy: {
      flex: 1,
      minWidth: 0,
    },
    nameRow: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: spacing[2],
    },
    name: {
      flex: 1,
      minWidth: 0,
    },
    metaRow: {
      marginTop:
        spacing[2],
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: 5,
    },
    statusRow: {
      marginTop:
        spacing[2],
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 6,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    stats: {
      marginTop:
        spacing[4],
      flexDirection:
        'row',
      gap: spacing[2],
    },
    stat: {
      flex: 1,
      minWidth: 0,
      minHeight: 72,
      borderRadius: 14,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 6,
    },
    statValue: {
      marginTop: 4,
    },
    about: {
      marginTop:
        spacing[4],
      paddingTop:
        spacing[4],
      borderTopWidth:
        StyleSheet.hairlineWidth,
    },
    aboutText: {
      marginTop:
        spacing[2],
    },
    section: {
      marginTop:
        spacing[6],
      gap: spacing[2],
    },
    menuCard: {
      padding: 0,
      overflow:
        'hidden',
    },
    menuRow: {
      minHeight: 70,
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[2],
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: spacing[3],
      borderBottomWidth:
        StyleSheet.hairlineWidth,
      borderBottomColor:
        '#E4EAE7',
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems:
        'center',
      justifyContent:
        'center',
      flexShrink: 0,
    },
    menuCopy: {
      flex: 1,
      minWidth: 0,
    },
    roleSection: {
      marginTop:
        spacing[6],
    },
    switchButton: {
      marginTop:
        spacing[2],
    },
    flex: {
      flex: 1,
      minWidth: 0,
    },
    smallGap: {
      marginTop:
        spacing[1],
    },
    tinyGap: {
      marginTop: 2,
    },
    skeletonCopy: {
      flex: 1,
      minWidth: 0,
    },
  });
