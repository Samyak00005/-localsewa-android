import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { useAuth } from '../../auth';
import { AppIcon, AppIconName, iconSize } from '../../components/icons';
import { useProviderOverlayBlur } from '../../components/provider';
import {
  AlertBanner,
  AppSwitch,
  AppText,
  Avatar,
  Button,
  Card,
  Input,
  Skeleton,
} from '../../components/ui';
import {
  useProviderAvailability,
  useProviderBusinessImageDelete,
  useProviderBusinessImageUpload,
  useProviderDashboard,
  useProviderProfileUpdate,
} from '../../hooks/useProviderWorkspace';
import { ProviderTabParamList } from '../../navigation/types';
import { pickProfilePhoto } from '../../native/profilePhotoPicker';
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
  const businessImageUpload = useProviderBusinessImageUpload();
  const businessImageDelete = useProviderBusinessImageDelete();
  const profileUpdate = useProviderProfileUpdate();

  const [logoutBusy, setLogoutBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [businessMediaOpen, setBusinessMediaOpen] = useState(false);
  const [selectedBusinessImageId, setSelectedBusinessImageId] = useState<number | null>(null);
  const [businessImageOrder, setBusinessImageOrder] = useState<number[]>([]);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const premium = providerTier === 'LOCALSEWA_PLUS';
  const profile = data?.profile;
  const displayName = profile?.businessName || user?.full_name || 'Provider';

  useEffect(() => {
    const imageIds = profile?.businessImages.map(image => image.id) ?? [];

    setBusinessImageOrder(current => {
      const retained = current.filter(id => imageIds.includes(id));
      const added = imageIds.filter(id => !retained.includes(id));
      const next = [...retained, ...added];

      if (next.length === current.length && next.every((id, index) => id === current[index])) {
        return current;
      }

      return next;
    });
  }, [profile?.businessImages]);

  const orderedBusinessImages = useMemo(() => {
    const images = profile?.businessImages ?? [];

    if (!businessImageOrder.length) {
      return images;
    }

    const byId = new Map(images.map(image => [image.id, image]));
    const ordered = businessImageOrder
      .map(id => byId.get(id))
      .filter((image): image is ProviderBusinessImage => Boolean(image));
    const remaining = images.filter(
      image => !businessImageOrder.includes(image.id),
    );

    return [...ordered, ...remaining];
  }, [businessImageOrder, profile?.businessImages]);

  async function updateAvailability(value: boolean) {
    setActionError(null);

    try {
      await availability.mutateAsync(value);
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    }
  }

  async function addBusinessPhoto() {
    if (!profile || businessImageUpload.isPending) {
      return;
    }

    if (profile.businessImages.length >= 5) {
      Alert.alert(
        'Business photos',
        'You can add a maximum of 5 business photos.',
      );
      return;
    }

    setActionError(null);

    try {
      const image = await pickProfilePhoto();

      if (!image) {
        return;
      }

      await businessImageUpload.mutateAsync({
        uri: image.uri,
        name: image.name,
        type: image.type,
      });
    } catch (uploadError) {
      setActionError(errorMessage(uploadError));
    }
  }

  function openBusinessMedia(imageId?: number) {
    const selected =
      imageId ?? orderedBusinessImages[0]?.id ?? null;

    setSelectedBusinessImageId(selected);
    setBusinessMediaOpen(true);
  }

  async function deleteBusinessPhoto(imageId: number) {
    setActionError(null);

    try {
      const images = await businessImageDelete.mutateAsync(imageId);
      setSelectedBusinessImageId(images[0]?.id ?? null);
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    }
  }

  const mediaOverlayOpen = businessMediaOpen || profilePhotoOpen;
  useProviderOverlayBlur(mediaOverlayOpen);

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
      <View
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
      >
      <ScrollView
        style={styles.scroll}
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
                images={orderedBusinessImages}
                onOpen={openBusinessMedia}
                onAdd={addBusinessPhoto}
                adding={businessImageUpload.isPending}
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
                      accessibilityRole="button"
                      accessibilityLabel="Manage provider profile photo"
                      onPress={() => setProfilePhotoOpen(true)}
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
              <ProviderMenuRow
                icon="camera"
                title="Manage photos"
                subtitle="Add, move or remove business photos"
                onPress={() => openBusinessMedia()}
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
      </View>

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

      {profile ? (
        <>
          <BusinessMediaManager
            visible={businessMediaOpen}
            images={orderedBusinessImages}
            selectedId={selectedBusinessImageId}
            adding={businessImageUpload.isPending}
            deleting={businessImageDelete.isPending}
            onSelect={setSelectedBusinessImageId}
            onReorder={setBusinessImageOrder}
            onAdd={addBusinessPhoto}
            onDelete={deleteBusinessPhoto}
            onClose={() => setBusinessMediaOpen(false)}
          />

          <ProfilePhotoManager
            visible={profilePhotoOpen}
            uri={profile.profileImageUrl ?? null}
            onClose={() => setProfilePhotoOpen(false)}
          />
        </>
      ) : null}
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
  onAdd,
  adding,
}: {
  images: ProviderBusinessImage[];
  onOpen: (imageId: number) => void;
  onAdd: () => void;
  adding: boolean;
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
          Add work and business photos to help customers understand your services.
        </AppText>
        <Pressable
          accessibilityRole="button"
          disabled={adding}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.galleryAddEmpty,
            {
              backgroundColor: pressed
                ? theme.colors.primaryPressed ?? theme.colors.primary
                : theme.colors.primary,
              opacity: adding ? 0.55 : 1,
            },
          ]}
        >
          <AppIcon name="camera" size={iconSize.xs} color="#FFFFFF" />
          <AppText variant="label" color="#FFFFFF">
            {adding ? 'Adding…' : 'Add photos'}
          </AppText>
        </Pressable>
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
            onPress={() => onOpen(image.id)}
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

          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add business photos"
        disabled={adding || images.length >= 5}
        onPress={onAdd}
        style={({ pressed }) => [
          styles.galleryAddBadge,
          {
            opacity: adding || images.length >= 5 ? 0.58 : pressed ? 0.82 : 1,
          },
        ]}
      >
        <AppIcon name="camera" size={iconSize.xs} color="#FFFFFF" />
        <AppText variant="caption" color="#FFFFFF">
          {adding ? 'Adding…' : images.length >= 5 ? '5 / 5 photos' : 'Add photos'}
        </AppText>
      </Pressable>

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
      <View style={styles.statMain}>
        <AppIcon name={icon} size={iconSize.xs} color={theme.colors.primary} />
        <AppText variant="label">{value}</AppText>
      </View>
      <AppText variant="caption" muted style={styles.statLabel}>
        {label}
      </AppText>
    </View>
  );
}

function BusinessMediaManager({
  visible,
  images,
  selectedId,
  adding,
  deleting,
  onSelect,
  onReorder,
  onAdd,
  onDelete,
  onClose,
}: {
  visible: boolean;
  images: ProviderBusinessImage[];
  selectedId: number | null;
  adding: boolean;
  deleting: boolean;
  onSelect: (imageId: number | null) => void;
  onReorder: (imageIds: number[]) => void;
  onAdd: () => void;
  onDelete: (imageId: number) => Promise<void>;
  onClose: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const galleryRef = React.useRef<FlatList<ProviderBusinessImage>>(null);
  const stageWidth = Math.max(1, windowWidth - layout.screenHorizontal * 2);
  const selected =
    images.find(image => image.id === selectedId) ?? images[0] ?? null;
  const selectedIndex = selected
    ? Math.max(0, images.findIndex(image => image.id === selected.id))
    : -1;
  const busy = adding || deleting;

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    if (!selected && selectedId !== null) {
      onSelect(images[0]?.id ?? null);
    } else if (selected && selected.id !== selectedId) {
      onSelect(selected.id);
    }
  }, [images, onSelect, selected, selectedId, visible]);

  React.useEffect(() => {
    if (!visible || selectedIndex < 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      galleryRef.current?.scrollToOffset({
        offset: selectedIndex * stageWidth,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedIndex, stageWidth, visible]);

  function moveSelected(delta: -1 | 1) {
    if (busy || !selected || selectedIndex < 0) {
      return;
    }

    const targetIndex = selectedIndex + delta;
    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const reordered = [...images];
    const [moving] = reordered.splice(selectedIndex, 1);
    reordered.splice(targetIndex, 0, moving);

    onReorder(reordered.map(image => image.id));
    onSelect(selected.id);

    requestAnimationFrame(() => {
      galleryRef.current?.scrollToOffset({
        offset: targetIndex * stageWidth,
        animated: true,
      });
    });
  }

  function confirmDelete() {
    if (!selected || busy) {
      return;
    }

    Alert.alert(
      'Delete this business photo?',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void onDelete(selected.id);
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={busy ? undefined : onClose}
    >
      <View style={styles.mediaOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={busy ? undefined : onClose}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close business photo manager"
          disabled={busy}
          onPress={onClose}
          style={[
            styles.mediaClose,
            {
              top: insets.top + 12,
              right: layout.screenHorizontal,
              opacity: busy ? 0.55 : 1,
            },
          ]}
        >
          <AppIcon name="x" size={iconSize.md} color="#FFFFFF" />
        </Pressable>

        <View
          style={[
            styles.mediaStage,
            {
              marginTop: insets.top + 72,
              marginBottom: insets.bottom + 198,
            },
          ]}
        >
          {selected ? (
            <FlatList
              ref={galleryRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => String(item.id)}
              style={{ width: stageWidth, flex: 1 }}
              getItemLayout={(_data, index) => ({
                length: stageWidth,
                offset: stageWidth * index,
                index,
              })}
              onMomentumScrollEnd={event => {
                const index = Math.max(
                  0,
                  Math.min(
                    images.length - 1,
                    Math.round(event.nativeEvent.contentOffset.x / stageWidth),
                  ),
                );
                const image = images[index];
                if (image && image.id !== selectedId) {
                  onSelect(image.id);
                }
              }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.mediaImagePage,
                    { width: stageWidth },
                  ]}
                >
                  <Image
                    source={{ uri: item.url }}
                    resizeMode="contain"
                    style={styles.mediaMainImage}
                  />
                </View>
              )}
            />
          ) : (
            <View style={styles.mediaEmptyStage}>
              <AppIcon name="camera" size={iconSize.xl} color="#D7E3DF" />
              <AppText variant="title" color="#FFFFFF" style={styles.mediaEmptyTitle}>
                No business photos yet
              </AppText>
            </View>
          )}
        </View>

        <View
          style={[
            styles.mediaTray,
            {
              bottom: insets.bottom + spacing[3],
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.mediaTrayTop}>
            <View>
              <AppText variant="title">Business photos</AppText>
              <AppText variant="caption" muted style={styles.smallGap}>
                {images.length} / 5 photos
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={busy || images.length >= 5}
              onPress={onAdd}
              style={({ pressed }) => [
                styles.mediaAddButton,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                  opacity:
                    busy || images.length >= 5 ? 0.45 : pressed ? 0.72 : 1,
                },
              ]}
            >
              <AppIcon name="plus" size={iconSize.xs} color={theme.colors.primary} />
              <AppText variant="label" color={theme.colors.primary}>
                {adding ? 'Adding…' : 'Add'}
              </AppText>
            </Pressable>
          </View>

          {images.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaThumbs}
            >
              {images.map((image, index) => {
                const active = image.id === selected?.id;

                return (
                  <Pressable
                    key={image.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Select business photo ${index + 1}`}
                    onPress={() => onSelect(image.id)}
                    style={[
                      styles.mediaThumb,
                      {
                        borderColor: active
                          ? theme.colors.primary
                          : theme.colors.border,
                        borderWidth: active ? 2 : 1,
                      },
                    ]}
                  >
                    <Image source={{ uri: image.url }} style={styles.mediaThumbImage} />
                    <View style={styles.mediaThumbNumber}>
                      <AppText variant="caption" color="#FFFFFF">
                        {index + 1}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.mediaEmptyThumbs,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <AppText variant="caption" muted>
                Add a photo to start your business gallery.
              </AppText>
            </View>
          )}

          <View style={styles.mediaActions}>
            <MediaActionButton
              icon="chevronLeft"
              label="Move left"
              disabled={busy || selectedIndex <= 0}
              onPress={() => moveSelected(-1)}
            />
            <MediaActionButton
              icon="chevronRight"
              label="Move right"
              disabled={busy || selectedIndex < 0 || selectedIndex >= images.length - 1}
              onPress={() => moveSelected(1)}
            />
            <MediaActionButton
              icon="trash"
              label={deleting ? 'Deleting…' : 'Delete'}
              danger
              disabled={busy || !selected}
              onPress={confirmDelete}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProfilePhotoManager({
  visible,
  uri,
  onClose,
}: {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  function explainChange() {
    Alert.alert(
      'Change profile photo',
      'Native profile-photo upload is temporarily paused until server-side metadata stripping is enforced for regular image uploads.',
    );
  }

  function explainRemove() {
    Alert.alert(
      'Remove profile photo',
      'The current backend does not expose a safe profile-photo removal endpoint yet.',
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.mediaOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close profile photo"
          onPress={onClose}
          style={[
            styles.mediaClose,
            {
              top: insets.top + 12,
              right: layout.screenHorizontal,
            },
          ]}
        >
          <AppIcon name="x" size={iconSize.md} color="#FFFFFF" />
        </Pressable>

        <View
          style={[
            styles.profilePhotoStage,
            {
              marginTop: insets.top + 76,
              marginBottom: insets.bottom + 126,
            },
          ]}
        >
          {uri ? (
            <Image source={{ uri }} resizeMode="contain" style={styles.mediaMainImage} />
          ) : (
            <View style={styles.mediaEmptyStage}>
              <AppIcon name="user" size={iconSize.xl} color="#D7E3DF" />
              <AppText variant="title" color="#FFFFFF" style={styles.mediaEmptyTitle}>
                No profile photo
              </AppText>
            </View>
          )}
        </View>

        <View
          style={[
            styles.profilePhotoTray,
            {
              bottom: insets.bottom + spacing[3],
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <MediaActionButton
            icon="camera"
            label="Change photo"
            onPress={explainChange}
          />
          <MediaActionButton
            icon="trash"
            label="Remove photo"
            danger
            onPress={explainRemove}
          />
        </View>
      </View>
    </Modal>
  );
}

function MediaActionButton({
  icon,
  label,
  danger = false,
  disabled = false,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const color = danger ? theme.colors.error : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.mediaAction,
        {
          backgroundColor: danger
            ? 'rgba(198,45,40,0.08)'
            : theme.colors.surfaceMuted,
          borderColor: danger
            ? 'rgba(198,45,40,0.18)'
            : theme.colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppIcon name={icon} size={iconSize.xs} color={color} />
      <AppText variant="label" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
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
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  errorBlock: { gap: spacing[3] },
  identityCard: {
    borderRadius: 28,
    padding: spacing[3],
    overflow: 'hidden',
  },
  profileBody: {
    paddingTop: spacing[3],
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[1],
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  profileAvatarFrame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarPremiumFrame: {
    borderWidth: 3,
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
    marginTop: spacing[3],
    flexDirection: 'row',
    gap: spacing[2],
  },
  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  statMain: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  statLabel: { marginTop: 1 },
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
    marginTop: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
  },
  aboutText: { marginTop: spacing[1], lineHeight: 20 },
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
  galleryAddBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(8,31,22,0.78)',
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
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
  galleryAddEmpty: {
    minHeight: 42,
    marginTop: spacing[4],
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
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
  editButton: {
    marginTop: spacing[3],
    minHeight: 52,
    borderRadius: radius.pill,
  },
  editOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 17, 13, 0.42)',
    paddingHorizontal: layout.bottomSheetMargin,
    paddingBottom: layout.bottomSheetMargin,
  },
  editSheet: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: spacing[5],
    overflow: 'hidden',
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
  mediaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 18, 34, 0.44)',
  },
  mediaClose: {
    position: 'absolute',
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(7,27,45,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaStage: {
    flex: 1,
    marginHorizontal: layout.screenHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePhotoStage: {
    flex: 1,
    marginHorizontal: layout.screenHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaImagePage: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  mediaMainImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
  },
  mediaEmptyStage: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  mediaEmptyTitle: { marginTop: spacing[1] },
  mediaTray: {
    position: 'absolute',
    left: layout.screenHorizontal,
    right: layout.screenHorizontal,
    borderWidth: 1,
    borderRadius: 28,
    padding: spacing[3],
    gap: spacing[3],
  },
  mediaTrayTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  mediaThumbs: {
    gap: spacing[2],
    paddingRight: spacing[1],
  },
  mediaAddButton: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  mediaThumb: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbImage: {
    width: '100%',
    height: '100%',
  },
  mediaThumbNumber: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(8,31,22,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaEmptyThumbs: {
    minHeight: 58,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
  },
  mediaActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  mediaAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  profilePhotoTray: {
    position: 'absolute',
    left: layout.screenHorizontal,
    right: layout.screenHorizontal,
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 28,
    padding: spacing[3],
    flexDirection: 'row',
    gap: spacing[2],
  },
});
