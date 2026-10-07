import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { useAuth } from '../../auth';
import { AppIcon, AppIconName, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppSwitch,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
} from '../../components/ui';
import {
  useProviderAvailability,
  useProviderDashboard,
  useProviderProfileUpdate,
} from '../../hooks/useProviderWorkspace';
import { ProviderTabParamList } from '../../navigation/types';
import {
  ProviderBusinessImage,
  ProviderProfileUpdate,
  ProviderWorkspaceProfile,
} from '../../types/providerWorkspace';
import {
  customerPalette,
  layout,
  localsewaPlusPalette,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props = BottomTabScreenProps<ProviderTabParamList, 'ProviderProfile'>;

export function ProviderProfileScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const {
    providerTier,
    providerPremiumVisuals,
    setProviderThemePreference,
    enterCustomer,
  } = useAppShell();
  const { user, logout } = useAuth();
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviderDashboard();
  const availability = useProviderAvailability();
  const profileUpdate = useProviderProfileUpdate();

  const [logoutBusy, setLogoutBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const premium = providerTier === 'LOCALSEWA_PLUS';
  const profile = data?.profile;
  const displayName = profile?.businessName || user?.full_name || 'Provider';

  async function updateAvailability(value: boolean) {
    setActionError(null);

    try {
      await availability.mutateAsync(value);
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    }
  }

  async function signOut() {
    setActionError(null);
    setLogoutBusy(true);

    try {
      await logout();
    } catch (signOutError) {
      setActionError(errorMessage(signOutError));
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={theme.colors.primary}
          />
        }
      >
        {actionError ? (
          <AlertBanner variant="error">{actionError}</AlertBanner>
        ) : null}

        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <View style={styles.errorBlock}>
            <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
            <Button
              label="Retry"
              loading={isRefetching}
              onPress={() => refetch()}
              fullWidth
            />
          </View>
        ) : profile ? (
          <>
            <Card style={styles.identityCard}>
              <BusinessGallery
                images={profile.businessImages}
                onOpen={setViewerImage}
              />

              <View style={styles.profileBody}>
                <View style={styles.identityRow}>
                  <View
                    style={[
                      styles.profileAvatarFrame,
                      premium && styles.profileAvatarPremiumFrame,
                    ]}
                  >
                    <Pressable
                      accessibilityRole={profile.profileImageUrl ? 'button' : undefined}
                      accessibilityLabel="Provider profile photo"
                      disabled={!profile.profileImageUrl}
                      onPress={() =>
                        profile.profileImageUrl
                          ? setViewerImage(profile.profileImageUrl)
                          : undefined
                      }
                    >
                      {profile.profileImageUrl ? (
                        <Image
                          source={{ uri: profile.profileImageUrl }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Avatar initials={displayName} size="lg" />
                      )}
                    </Pressable>
                  </View>

                  <View style={styles.identityCopy}>
                    <View style={styles.nameRow}>
                      <AppText variant="h2" numberOfLines={2} style={styles.name}>
                        {displayName}
                      </AppText>

                      <Badge variant={profile.available ? 'success' : 'default'}>
                        {profile.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </Badge>
                    </View>

                    {profile.category ? (
                      <AppText
                        variant="label"
                        color={theme.colors.primary}
                        style={styles.smallGap}
                      >
                        {profile.category}
                      </AppText>
                    ) : null}

                    {profile.location ? (
                      <View style={styles.metaRow}>
                        <AppIcon
                          name="mapPin"
                          size={iconSize.xs}
                          color={theme.colors.textMuted}
                        />
                        <AppText
                          variant="caption"
                          muted
                          numberOfLines={2}
                          style={styles.flex}
                        >
                          {profile.location}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.stats}>
                  <ProviderStat
                    icon="star"
                    value={
                      profile.averageRating == null
                        ? 'New'
                        : profile.averageRating.toFixed(1)
                    }
                    label="Rating"
                  />
                  <ProviderStat
                    icon="message"
                    value={String(profile.reviewCount)}
                    label="Reviews"
                  />
                  <ProviderStat
                    icon="briefcase"
                    value={
                      profile.experienceYears == null
                        ? '—'
                        : `${profile.experienceYears} yr`
                    }
                    label="Experience"
                  />
                </View>

                <View
                  style={[styles.about, { borderTopColor: theme.colors.border }]}
                >
                  <AppText variant="title">About</AppText>
                  <AppText variant="bodySmall" muted style={styles.aboutText}>
                    {profile.description ||
                      'No business description has been added yet.'}
                  </AppText>
                </View>

                <Button
                  label="Edit business profile"
                  variant="outline"
                  icon="userEdit"
                  onPress={() => setEditOpen(true)}
                  fullWidth
                  style={styles.editButton}
                />
              </View>
            </Card>

            <Card style={styles.availabilityCard}>
              <AppSwitch
                value={profile.available}
                onValueChange={updateAvailability}
                disabled={availability.isPending}
                label="Available for work"
                description="Customers can see this live availability state."
              />

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: profile.available
                        ? theme.colors.success
                        : theme.colors.disabled,
                    },
                  ]}
                />
                <AppText
                  variant="caption"
                  color={
                    profile.available
                      ? theme.colors.success
                      : theme.colors.textMuted
                  }
                >
                  {profile.available ? 'Currently available' : 'Currently unavailable'}
                </AppText>
              </View>
            </Card>

            <Card
              style={[
                styles.planCard,
                premium && {
                  backgroundColor: localsewaPlusPalette.premiumIvory,
                  borderColor: localsewaPlusPalette.softGold,
                },
              ]}
            >
              <View
                style={[
                  styles.planIcon,
                  {
                    backgroundColor: premium
                      ? localsewaPlusPalette.softGold
                      : theme.colors.secondary,
                  },
                ]}
              >
                <AppIcon
                  name={premium ? 'sparkles' : 'briefcase'}
                  size={iconSize.md}
                  color={
                    premium
                      ? localsewaPlusPalette.strongGold
                      : theme.colors.primary
                  }
                />
              </View>
              <View style={styles.flex}>
                <AppText variant="title">
                  {providerTier === 'LOCALSEWA_PLUS'
                    ? 'Localsewa+ Provider'
                    : 'Standard Provider'}
                </AppText>
                <AppText variant="caption" muted style={styles.smallGap}>
                  {providerTier === 'LOCALSEWA_PLUS'
                    ? 'Premium entitlement is active from the live membership API.'
                    : 'Standard Provider workspace is active.'}
                </AppText>
              </View>
            </Card>

            {premium ? (
              <ProviderSection title="Appearance">
                <ProviderThemeToggleRow
                  value={providerPremiumVisuals}
                  onValueChange={enabled =>
                    setProviderThemePreference(enabled ? 'premium' : 'standard')
                  }
                />
              </ProviderSection>
            ) : null}

            <ProviderSection title="Provider workspace">
              <ProviderMenuRow
                icon="wrench"
                title="My services"
                subtitle="Open the Provider Services workspace"
                onPress={() => navigation.navigate('ProviderServices')}
              />
              <ProviderMenuRow
                icon="star"
                title="Reviews"
                subtitle="Read customer feedback from completed services"
                onPress={() => navigation.navigate('ProviderReviews')}
              />
            </ProviderSection>

            <View style={styles.roleSection}>
              <AppText variant="overline" muted>
                WORKSPACE
              </AppText>
              <ProviderWorkspaceSwitchButton onPress={enterCustomer} />
            </View>

            <Button
              label="Sign out"
              variant="destructive"
              icon="logOut"
              loading={logoutBusy}
              onPress={signOut}
              fullWidth
            />
          </>
        ) : null}
      </ScrollView>

      {profile ? (
        <ProviderProfileEditModal
          visible={editOpen}
          profile={profile}
          saving={profileUpdate.isPending}
          onClose={() => setEditOpen(false)}
          onSave={async values => {
            setActionError(null);
            await profileUpdate.mutateAsync(values);
            setEditOpen(false);
          }}
        />
      ) : null}

      <PhotoViewer uri={viewerImage} onClose={() => setViewerImage(null)} />
    </>
  );
}

function ProviderProfileEditModal({
  visible,
  profile,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  profile: ProviderWorkspaceProfile;
  saving: boolean;
  onClose: () => void;
  onSave: (profile: ProviderProfileUpdate) => Promise<void>;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName ?? '');
  const [description, setDescription] = useState(profile.description ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setBusinessName(profile.businessName);
    setOwnerName(profile.ownerName ?? '');
    setDescription(profile.description ?? '');
    setValidationError(null);
  }, [profile, visible]);

  async function submit() {
    const normalizedBusinessName = businessName.trim();
    if (normalizedBusinessName.length < 2) {
      setValidationError('Business name must be at least 2 characters.');
      return;
    }

    setValidationError(null);

    try {
      await onSave({
        businessName: normalizedBusinessName,
        ownerName: ownerName.trim(),
        description: description.trim(),
        location: profile.location,
        latitude: profile.latitude,
        longitude: profile.longitude,
        whatsapp: profile.whatsapp,
      });
    } catch (saveError) {
      setValidationError(errorMessage(saveError));
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={saving ? undefined : onClose}
    >
      <View style={styles.editOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={saving ? undefined : onClose}
        />

        <View
          style={[
            styles.editSheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.editHeading}>
            <View style={styles.flex}>
              <AppText variant="h2">Edit business profile</AppText>
              <AppText variant="caption" muted style={styles.smallGap}>
                Update the business fields supported by the current Provider profile API.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close profile editor"
              disabled={saving}
              onPress={onClose}
              style={({ pressed }) => [
                styles.editClose,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  opacity: pressed || saving ? 0.65 : 1,
                },
              ]}
            >
              <AppIcon name="x" size={iconSize.sm} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.editFields}
          >
            {validationError ? (
              <AlertBanner variant="error">{validationError}</AlertBanner>
            ) : null}

            <Input
              label="Business name"
              value={businessName}
              onChangeText={setBusinessName}
              maxLength={180}
              autoCapitalize="words"
              editable={!saving}
            />

            <Input
              label="Owner name"
              value={ownerName}
              onChangeText={setOwnerName}
              maxLength={120}
              autoCapitalize="words"
              editable={!saving}
            />

            <Input
              label="About"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={1200}
              editable={!saving}
              style={styles.descriptionInput}
            />

            <Input
              label="Service area"
              value={profile.location ?? ''}
              editable={false}
              helperText="Location editing stays on the verified location flow; this build preserves the current service area."
            />
          </ScrollView>

          <View style={[styles.editActions, { borderTopColor: theme.colors.border }]}>
            <Button
              label="Cancel"
              variant="outline"
              disabled={saving}
              onPress={onClose}
              style={styles.flexButton}
            />
            <Button
              label="Save changes"
              loading={saving}
              onPress={submit}
              style={styles.flexButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BusinessGallery({
  images,
  onOpen,
}: {
  images: ProviderBusinessImage[];
  onOpen: (uri: string) => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryWidth, setGalleryWidth] = useState(1);

  if (!images.length) {
    return (
      <View
        style={[
          styles.galleryEmpty,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
          },
        ]}
      >
        <AppIcon
          name="camera"
          size={iconSize.lg}
          color={theme.colors.textMuted}
        />
        <AppText variant="title" style={styles.galleryEmptyTitle}>
          No business photos yet
        </AppText>
        <AppText variant="bodySmall" muted style={styles.galleryEmptyCopy}>
          Existing business photos will appear here when the backend returns them.
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.galleryFrame,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondary,
        },
      ]}
      onLayout={event => {
        const width = event.nativeEvent.layout.width;

        if (width > 0) {
          setGalleryWidth(width);
        }
      }}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const nextIndex = Math.round(
            event.nativeEvent.contentOffset.x / galleryWidth,
          );

          setGalleryIndex(
            Math.max(0, Math.min(images.length - 1, nextIndex)),
          );
        }}
      >
        {images.map((image, index) => (
          <Pressable
            key={image.id}
            accessibilityRole="button"
            accessibilityLabel={`Open business photo ${index + 1}`}
            onPress={() => onOpen(image.url)}
            style={({ pressed }) => [
              { width: galleryWidth },
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Image
              source={{ uri: image.url }}
              resizeMode="cover"
              style={styles.galleryImage}
            />

            {image.isCover ? (
              <View style={styles.coverBadge}>
                <AppText variant="caption" color="#FFFFFF">
                  Cover
                </AppText>
              </View>
            ) : null}

            <View style={styles.galleryOpenBadge}>
              <AppIcon
                name="externalLink"
                size={iconSize.xs}
                color="#FFFFFF"
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {images.length > 1 ? (
        <View style={styles.galleryCount}>
          <AppText variant="caption" color="#FFFFFF">
            {galleryIndex + 1} / {images.length}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function ProviderSection({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>): React.JSX.Element {
  return (
    <View style={styles.section}>
      <AppText variant="overline" muted>
        {title.toUpperCase()}
      </AppText>
      <Card style={styles.menuCard}>{children}</Card>
    </View>
  );
}

function ProviderMenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: AppIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, { opacity: pressed ? 0.72 : 1 }]}
    >
      <View
        style={[styles.menuIcon, { backgroundColor: theme.colors.secondary }]}
      >
        <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" muted style={styles.smallGap}>
          {subtitle}
        </AppText>
      </View>
      <AppIcon
        name="chevronRight"
        size={iconSize.sm}
        color={theme.colors.textMuted}
      />
    </Pressable>
  );
}

function ProviderThemeToggleRow({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.menuRow}>
      <View
        style={[styles.menuIcon, { backgroundColor: theme.colors.secondary }]}
      >
        <AppIcon
          name="sparkles"
          size={iconSize.sm}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.flex}>
        <AppText variant="label">Localsewa+ theme</AppText>
        <AppText variant="caption" muted style={styles.smallGap}>
          {value
            ? 'Premium theme accents are on.'
            : 'Normal Provider colors are on. Your Localsewa+ benefits stay active.'}
        </AppText>
      </View>

      <Switch
        accessibilityLabel="Localsewa+ theme"
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.surfaceMuted,
          true: theme.colors.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function ProviderWorkspaceSwitchButton({
  onPress,
}: {
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Switch to Customer"
      onPress={onPress}
      style={({ pressed }) => [
        styles.workspaceSwitchButton,
        {
          backgroundColor: pressed ? '#E4F4E9' : '#EEF8F1',
          borderColor: customerPalette.secondary,
        },
      ]}
    >
      <View pointerEvents="none" style={styles.workspaceSwitchGlowTop} />
      <View pointerEvents="none" style={styles.workspaceSwitchGlowBottom} />

      <View style={styles.workspaceSwitchIcon}>
        <AppIcon
          name="user"
          size={iconSize.sm}
          color={customerPalette.primary}
        />
      </View>

      <View style={styles.flex}>
        <AppText variant="label">Switch to Customer</AppText>
        <AppText variant="caption" muted style={styles.smallGap}>
          Open your customer home and booking tools
        </AppText>
      </View>

      <AppIcon
        name="chevronRight"
        size={iconSize.sm}
        color={customerPalette.primary}
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
  const { theme } = useAppTheme();

  return (
    <View style={styles.stat}>
      <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      <AppText variant="title" style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

function PhotoViewer({
  uri,
  onClose,
}: {
  uri: string | null;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <Modal
      visible={Boolean(uri)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.viewerOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {uri ? <Image source={{ uri }} style={styles.viewerImage} resizeMode="contain" /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close photo"
          onPress={onClose}
          style={styles.viewerClose}
        >
          <AppIcon name="x" size={iconSize.md} color="#FFFFFF" />
        </Pressable>
      </View>
    </Modal>
  );
}

function ProfileSkeleton(): React.JSX.Element {
  return (
    <View style={styles.skeletonStack}>
      <Skeleton height={300} radiusValue={28} />
      <Skeleton height={104} radiusValue={28} />
      <Skeleton height={84} radiusValue={28} />
      <Skeleton height={150} radiusValue={28} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  errorBlock: { gap: spacing[3] },
  identityCard: {
    borderRadius: 28,
    padding: spacing[3],
    overflow: 'hidden',
  },
  profileBody: {
    paddingTop: spacing[4],
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[2],
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
  },
  profileAvatarFrame: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarPremiumFrame: {
    borderWidth: 2,
    borderColor: localsewaPlusPalette.strongGold,
    backgroundColor: localsewaPlusPalette.premiumIvory,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  identityCopy: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  name: { flexShrink: 1 },
  smallGap: { marginTop: spacing[1] },
  metaRow: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  flex: { flex: 1, minWidth: 0 },
  stats: {
    marginTop: spacing[5],
    flexDirection: 'row',
    gap: spacing[2],
  },
  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  statValue: { marginTop: spacing[1] },
  availabilityCard: {
    borderRadius: 28,
  },
  statusRow: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  about: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  aboutText: { marginTop: spacing[2], lineHeight: 21 },
  galleryFrame: {
    width: '100%',
    alignSelf: 'stretch',
    aspectRatio: 16 / 9,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: { width: '100%', height: '100%' },
  coverBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: 'rgba(14,48,36,0.88)',
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
  },
  galleryOpenBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(8,31,22,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCount: {
    position: 'absolute',
    right: spacing[2],
    bottom: spacing[2],
    minHeight: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(8,31,22,0.64)',
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryEmpty: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  galleryEmptyTitle: { marginTop: spacing[3] },
  galleryEmptyCopy: {
    marginTop: spacing[1],
    textAlign: 'center',
    maxWidth: 310,
  },
  planCard: {
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  planIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: spacing[2] },
  menuCard: {
    borderRadius: 28,
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  menuRow: {
    minHeight: 76,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSection: { gap: spacing[2] },
  workspaceSwitchButton: {
    minHeight: 76,
    marginTop: spacing[1],
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    overflow: 'hidden',
  },
  workspaceSwitchIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceSwitchGlowTop: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    right: -42,
    top: -68,
    backgroundColor: 'rgba(32,168,90,0.08)',
  },
  workspaceSwitchGlowBottom: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    right: 34,
    bottom: -104,
    backgroundColor: 'rgba(15,132,73,0.07)',
  },
  editButton: { marginTop: spacing[4] },
  editOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 17, 13, 0.42)',
  },
  editSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: spacing[5],
  },
  editHeading: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  editClose: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editFields: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  descriptionInput: {
    minHeight: 112,
    paddingTop: spacing[3],
  },
  editActions: {
    borderTopWidth: 1,
    padding: spacing[4],
    flexDirection: 'row',
    gap: spacing[3],
  },
  flexButton: { flex: 1 },
  skeletonStack: { gap: spacing[4] },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: { width: '94%', height: '78%' },
  viewerClose: {
    position: 'absolute',
    top: 50,
    right: spacing[4],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
