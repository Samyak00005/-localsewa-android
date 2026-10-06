import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { AppIcon, iconSize } from '../../components/icons';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { useProviderDetails } from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { ProviderService } from '../../types/provider';
import { layout, spacing, useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  'ProviderDetails'
>;

type MediaViewerState = {
  images: string[];
  index: number;
};

function money(value?: number): string | null {
  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function ProviderDetailsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryWidth, setGalleryWidth] = useState(1);
  const [viewer, setViewer] = useState<MediaViewerState | null>(null);

  const {
    data: provider,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviderDetails(route.params.providerId);


  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <CustomerHeader routeName="CustomerServices" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ProviderDetailsSkeleton />
        ) : error || !provider ? (
          <View style={styles.error}>
            <AlertBanner variant="error">
              {errorMessage(
                error ?? new Error('Provider could not be loaded.'),
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
              {provider.businessImageUrls.length ? (
                <View style={styles.galleryInset}>
                  <View
                    style={styles.gallery}
                    onLayout={event => {
                      const measuredWidth =
                        event.nativeEvent.layout.width;

                      if (measuredWidth > 0) {
                        setGalleryWidth(
                          measuredWidth,
                        );
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
                          Math.max(
                            0,
                            Math.min(
                              provider.businessImageUrls.length - 1,
                              nextIndex,
                            ),
                          ),
                        );
                      }}
                    >
                      {provider.businessImageUrls.map((imageUrl, index) => (
                        <Pressable
                          key={`${imageUrl}-${index}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Open business photo ${index + 1}`}
                          onPress={() =>
                            setViewer({
                              images: provider.businessImageUrls,
                              index,
                            })
                          }
                          style={{
                            width: galleryWidth,
                          }}
                        >
                          <Image
                            source={{
                              uri: imageUrl,
                            }}
                            resizeMode="cover"
                            style={styles.businessImage}
                          />

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

                    {provider.businessImageUrls.length > 1 ? (
                      <View style={styles.galleryCount}>
                        <AppText variant="caption" color="#FFFFFF">
                          {galleryIndex + 1} / {provider.businessImageUrls.length}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View style={styles.profileBody}>
                <View style={styles.profileRow}>
                  {provider.profileImageUrl ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open provider profile photo"
                      onPress={() =>
                        setViewer({
                          images: [provider.profileImageUrl!],
                          index: 0,
                        })
                      }
                      style={({ pressed }) => [
                        styles.profilePhotoPressable,
                        {
                          opacity: pressed ? 0.82 : 1,
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri: provider.profileImageUrl,
                        }}
                        style={styles.profileImage}
                      />

                      <View
                        style={[
                          styles.profileOpenBadge,
                          {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <AppIcon
                          name="externalLink"
                          size={12}
                          color={theme.colors.primary}
                        />
                      </View>
                    </Pressable>
                  ) : (
                    <Avatar initials={provider.name} size="lg" />
                  )}

                  <View style={styles.profileCopy}>
                    <View style={styles.nameRow}>
                      <AppText
                        variant="h2"
                        numberOfLines={2}
                        style={styles.name}
                      >
                        {provider.name}
                      </AppText>

                      <View
                        style={[
                          styles.availabilityChip,
                          {
                            backgroundColor:
                              provider.available
                                ? '#E5F7EB'
                                : '#EEF1EF',
                            borderColor:
                              provider.available
                                ? '#C4EACF'
                                : '#DCE3DF',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.availabilityDot,
                            {
                              backgroundColor:
                                provider.available
                                  ? '#22B863'
                                  : '#8A9991',
                            },
                          ]}
                        />

                        <AppText
                          variant="caption"
                          color={
                            provider.available
                              ? theme.colors.primary
                              : theme.colors.textMuted
                          }
                        >
                          {provider.available
                            ? 'Available'
                            : 'Unavailable'}
                        </AppText>
                      </View>
                    </View>

                    <AppText
                      variant="label"
                      color={theme.colors.primary}
                      style={styles.category}
                    >
                      {provider.category}
                    </AppText>

                    <View style={styles.locationRow}>
                      <AppIcon
                        name="mapPin"
                        size={14}
                        color={theme.colors.textMuted}
                      />

                      <AppText
                        variant="caption"
                        muted
                        numberOfLines={2}
                        style={styles.locationText}
                      >
                        {provider.location}
                      </AppText>
                    </View>

                    {provider.distanceLabel ? (
                      <AppText
                        variant="caption"
                        color={theme.colors.primary}
                        style={styles.distance}
                      >
                        {provider.distanceLabel}
                      </AppText>
                    ) : null}

                  </View>
                </View>

                <View style={styles.stats}>
                  <ProviderStat
                    icon="star"
                    label="Rating"
                    value={
                      provider.rating == null
                        ? 'New'
                        : provider.rating.toFixed(1)
                    }
                  />

                  <ProviderStat
                    icon="message"
                    label="Reviews"
                    value={String(provider.reviewCount)}
                  />

                  <ProviderStat
                    icon="briefcase"
                    label="Experience"
                    value={`${provider.experienceYears} yr`}
                  />
                </View>

                {provider.description ? (
                  <>
                    <View
                      style={[
                        styles.aboutDivider,
                        {
                          backgroundColor: theme.colors.border,
                        },
                      ]}
                    />

                    <View style={styles.aboutBlock}>
                      <AppText variant="title">About</AppText>

                      <AppText
                        variant="bodySmall"
                        color={theme.colors.textSecondary}
                        style={styles.aboutText}
                      >
                        {provider.description}
                      </AppText>
                    </View>
                  </>
                ) : null}
              </View>
            </Card>

            <Card style={styles.servicesCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitle}>
                  <View
                    style={[
                      styles.sectionIcon,
                      {
                        backgroundColor: theme.colors.secondary,
                      },
                    ]}
                  >
                    <AppIcon
                      name="servicesGrid"
                      size={iconSize.xs}
                      color={theme.colors.primary}
                    />
                  </View>

                  <AppText variant="title">Services</AppText>
                </View>

                <AppText variant="caption" muted>
                  {provider.serviceCount}{' '}
                  {provider.serviceCount === 1 ? 'service' : 'services'}
                </AppText>
              </View>

              {provider.services.length ? (
                <View style={styles.serviceList}>
                  {provider.services.map((service, index) => (
                    <ServiceRow
                      key={service.id}
                      index={index + 1}
                      service={service}
                      showDivider={
                        index < provider.services.length - 1
                      }
                    />
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyInset,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <AppText variant="bodySmall" muted>
                    No published service list yet. You can still send a custom
                    service request.
                  </AppText>
                </View>
              )}
            </Card>

            <Card style={styles.bookingCard}>
              <View
                style={[
                  styles.bookingIcon,
                  {
                    backgroundColor: theme.colors.secondary,
                  },
                ]}
              >
                <AppIcon
                  name="calendar"
                  size={iconSize.md}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.bookingCopy}>
                <AppText variant="title">
                  {provider.available
                    ? 'Ready to request this provider?'
                    : 'Provider currently unavailable'}
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  style={styles.bookingText}
                >
                  {provider.available
                    ? 'Choose a service, verify the job address and send your request. In-app chat becomes available after the provider accepts.'
                    : 'This provider is not accepting new booking requests right now.'}
                </AppText>
              </View>

              <Button
                label={
                  provider.available
                    ? 'Request service'
                    : 'Provider unavailable'
                }
                icon="calendar"
                disabled={!provider.available}
                onPress={() =>
                  navigation.navigate('BookingRequest', {
                    providerId: provider.id,
                  })
                }
                fullWidth
                style={styles.requestButton}
              />
            </Card>
          </>
        )}
      </ScrollView>

      <CustomerDetailBottomBar
        activeRoute="CustomerServices"
        onNavigate={tab =>
          navigation.navigate('CustomerTabs', {
            screen: tab,
          })
        }
      />

      <ProviderMediaViewer
        state={viewer}
        onClose={() => setViewer(null)}
      />
    </View>
  );
}

function ProviderStat({
  icon,
  label,
  value,
}: {
  icon: 'star' | 'message' | 'briefcase';
  label: string;
  value: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: theme.colors.surfaceMuted,
        },
      ]}
    >
      <AppIcon
        name={icon}
        size={15}
        color={theme.colors.primary}
      />

      <AppText variant="label" style={styles.statValue}>
        {value}
      </AppText>

      <AppText variant="caption" muted numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function ServiceRow({
  index,
  service,
  showDivider,
}: {
  index: number;
  service: ProviderService;
  showDivider: boolean;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  const servicePrice = money(service.price);

  return (
    <View>
      <View style={styles.serviceRow}>
        <View
          style={[
            styles.serviceNumber,
            {
              backgroundColor:
                theme.colors.secondary,
            },
          ]}
        >
          <AppText
            variant="caption"
            color={
              theme.colors.primary
            }
          >
            {index}
          </AppText>
        </View>

        <View style={styles.serviceCopy}>
          <AppText variant="label">
            {service.name}
          </AppText>

          {service.description ? (
            <AppText
              variant="caption"
              muted
              style={styles.smallGap}
            >
              {service.description}
            </AppText>
          ) : null}
        </View>

        {servicePrice ? (
          <AppText
            variant="label"
            color={theme.colors.primary}
            style={styles.servicePrice}
          >
            {servicePrice}
          </AppText>
        ) : null}
      </View>

      {showDivider ? (
        <View
          style={[
            styles.serviceDivider,
            {
              backgroundColor: theme.colors.border,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function ProviderMediaViewer({
  state,
  onClose,
}: {
  state: MediaViewerState | null;
  onClose: () => void;
}): React.JSX.Element {
  const { width, height } = useWindowDimensions();

  const [visibleIndex, setVisibleIndex] = useState(0);

  React.useEffect(() => {
    if (state) {
      setVisibleIndex(state.index);
    }
  }, [state]);

  if (!state) {
    return (
      <Modal
        visible={false}
        transparent
      />
    );
  }

  return (
    <Modal
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.viewer}>
        <View style={styles.viewerTopBar}>
          <AppText variant="label" color="#FFFFFF">
            {visibleIndex + 1} / {state.images.length}
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo viewer"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [
              styles.viewerClose,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <AppIcon
              name="x"
              size={iconSize.md}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{
            x: state.index * width,
            y: 0,
          }}
          onMomentumScrollEnd={event => {
            setVisibleIndex(
              Math.round(
                event.nativeEvent.contentOffset.x / width,
              ),
            );
          }}
        >
          {state.images.map((imageUrl, index) => (
            <View
              key={`${imageUrl}-${index}`}
              style={[
                styles.viewerPage,
                {
                  width,
                  height,
                },
              ]}
            >
              <Image
                source={{
                  uri: imageUrl,
                }}
                resizeMode="contain"
                style={styles.viewerImage}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function ProviderDetailsSkeleton(): React.JSX.Element {
  return (
    <>
      <Card style={styles.profileSkeletonCard}>
        <Skeleton
          width="100%"
          height={170}
          radiusValue={18}
        />

        <View style={styles.skeletonProfileRow}>
          <Skeleton
            width={72}
            height={72}
            radiusValue={36}
          />

          <View style={styles.skeletonProfileCopy}>
            <Skeleton width="68%" height={24} />

            <Skeleton
              width="42%"
              height={14}
              style={styles.skeletonSmallGap}
            />

            <Skeleton
              width="56%"
              height={12}
              style={styles.skeletonSmallGap}
            />
          </View>
        </View>

        <View style={styles.skeletonStats}>
          {[0, 1, 2].map(index => (
            <Skeleton
              key={index}
              width="31%"
              height={66}
              radiusValue={14}
            />
          ))}
        </View>
      </Card>

      {[0, 1].map(index => (
        <Card
          key={index}
          style={styles.skeletonSection}
        >
          <Skeleton width="38%" height={20} />
          <Skeleton
            width="100%"
            height={72}
            radiusValue={14}
            style={styles.skeletonGap}
          />
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
  },
  error: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  profileCard: {
    // Radius rule:
    // inner gallery radius (18) + gallery inset/padding (12) = outer radius (30)
    borderRadius: 30,
    padding: 0,
    overflow: 'hidden',
  },
  galleryInset: {
    width: '100%',
    paddingTop: spacing[3],
    paddingHorizontal: spacing[3],
  },
  gallery: {
    width: '100%',
    alignSelf: 'stretch',
    aspectRatio: 16 / 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE8E1',
    backgroundColor: '#E8EEEB',
    position: 'relative',
    overflow: 'hidden',
  },
  businessImage: {
    width: '100%',
    height: '100%',
  },
  galleryOpenBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(8,31,22,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCount: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    minHeight: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(8,31,22,0.64)',
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBody: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  profilePhotoPressable: {
    position: 'relative',
    width: 76,
    height: 76,
  },
  profileImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  profileOpenBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  name: {
    flex: 1,
    minWidth: 0,
  },
  category: {
    marginTop: spacing[1],
  },
  locationRow: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  locationText: {
    flex: 1,
  },
  distance: {
    marginTop: spacing[1],
  },
  availabilityChip: {
    minHeight: 28,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stats: {
    marginTop: spacing[3],
    flexDirection: 'row',
    gap: spacing[2],
  },
  stat: {
    flex: 1,
    minWidth: 0,
    minHeight: 70,
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginTop: 4,
  },
  aboutDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: spacing[3],
  },
  aboutBlock: {
    paddingTop: spacing[3],
  },
  aboutText: {
    marginTop: 6,
    lineHeight: 20,
  },
  servicesCard: {
    marginTop: spacing[4],
    borderRadius: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceList: {
    marginTop: spacing[3],
  },
  serviceRow: {
    minHeight: 62,
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  serviceNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceCopy: {
    flex: 1,
    minWidth: 0,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  servicePrice: {
    flexShrink: 0,
    marginLeft: spacing[2],
  },
  serviceDivider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyInset: {
    marginTop: spacing[3],
    borderRadius: 14,
    padding: spacing[3],
  },
  bookingCard: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
    borderRadius: 22,
  },
  bookingIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCopy: {
    marginTop: spacing[3],
  },
  bookingText: {
    marginTop: spacing[2],
    lineHeight: 20,
  },
  requestButton: {
    marginTop: spacing[4],
    borderRadius: 999,
  },
  viewer: {
    flex: 1,
    backgroundColor: '#050807',
  },
  viewerTopBar: {
    position: 'absolute',
    zIndex: 10,
    top: 42,
    left: 18,
    right: 18,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewerClose: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerPage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '82%',
  },
  profileSkeletonCard: {
    borderRadius: 22,
  },
  skeletonProfileRow: {
    marginTop: spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  skeletonProfileCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: spacing[1],
  },
  skeletonSmallGap: {
    marginTop: spacing[2],
  },
  skeletonStats: {
    marginTop: spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonSection: {
    marginTop: spacing[4],
    borderRadius: 20,
  },
  skeletonGap: {
    marginTop: spacing[3],
  },
});
