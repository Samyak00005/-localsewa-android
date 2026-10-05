import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
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
  Badge,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { useProviderDetails } from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { ProviderReview, ProviderService } from '../../types/provider';
import { layout, radius, spacing, useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  'ProviderDetails'
>;

function money(value?: number): string | null {
  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function reviewDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return null;
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return null;
  }

  return `${Number(match[3])} ${months[month - 1]} ${match[1]}`;
}

export function ProviderDetailsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

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
            <Card style={styles.heroCard}>
              <View style={styles.profileRow}>
                {provider.imageUrl ? (
                  <Image
                    source={{
                      uri: provider.imageUrl,
                    }}
                    style={styles.image}
                  />
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

                    {provider.verified ? (
                      <Badge variant="success">VERIFIED</Badge>
                    ) : null}
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
                      numberOfLines={1}
                      style={styles.locationText}
                    >
                      {provider.location}
                    </AppText>
                  </View>

                  {provider.distanceLabel ? (
                    <AppText
                      variant="caption"
                      muted
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

                <ProviderStat
                  icon="servicesGrid"
                  label="Services"
                  value={String(provider.serviceCount)}
                />
              </View>

              <View style={styles.statusRow}>
                <Badge variant={provider.available ? 'success' : 'default'}>
                  {provider.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                </Badge>

                {provider.homeService ? <Badge>HOME SERVICE</Badge> : null}

                {provider.shopService ? <Badge>SHOP SERVICE</Badge> : null}
              </View>
            </Card>

            {provider.description ? (
              <Card style={styles.sectionCard}>
                <SectionTitle title="About" icon="user" />

                <AppText
                  variant="bodySmall"
                  color={theme.colors.textSecondary}
                  style={styles.sectionText}
                >
                  {provider.description}
                </AppText>
              </Card>
            ) : null}

            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <SectionTitle title="Services" icon="servicesGrid" />

                <AppText variant="caption" muted>
                  {provider.serviceCount}{' '}
                  {provider.serviceCount === 1 ? 'service' : 'services'}
                </AppText>
              </View>

              <View style={styles.serviceList}>
                {provider.services.length ? (
                  provider.services.map(service => (
                    <ServiceRow key={service.id} service={service} />
                  ))
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
                      No published service list yet. You can still send a
                      custom service request.
                    </AppText>
                  </View>
                )}
              </View>
            </Card>

            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <SectionTitle title="Reviews" icon="star" />

                <AppText variant="caption" muted>
                  {provider.rating == null
                    ? `${provider.reviewCount} reviews`
                    : `${provider.rating.toFixed(1)} · ${provider.reviewCount} ${
                        provider.reviewCount === 1 ? 'review' : 'reviews'
                      }`}
                </AppText>
              </View>

              <View style={styles.reviewList}>
                {provider.reviews.length ? (
                  provider.reviews
                    .slice(0, 5)
                    .map(review => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                      />
                    ))
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
                      No written reviews yet.
                    </AppText>
                  </View>
                )}
              </View>
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
    </View>
  );
}

function ProviderStat({
  icon,
  label,
  value,
}: {
  icon: 'star' | 'message' | 'briefcase' | 'servicesGrid';
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

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon: 'user' | 'servicesGrid' | 'star';
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
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
          name={icon}
          size={iconSize.xs}
          color={theme.colors.primary}
        />
      </View>

      <AppText variant="title">{title}</AppText>
    </View>
  );
}

function ServiceRow({
  service,
}: {
  service: ProviderService;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  const servicePrice = money(service.price);

  return (
    <View
      style={[
        styles.serviceRow,
        {
          backgroundColor: '#F7FBF9',
          borderColor: theme.colors.border,
        },
      ]}
    >
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
        <View
          style={[
            styles.pricePill,
            {
              backgroundColor: theme.colors.secondary,
            },
          ]}
        >
          <AppText
            variant="label"
            color={theme.colors.primary}
          >
            {servicePrice}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function ReviewItem({
  review,
}: {
  review: ProviderReview;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  const date = reviewDate(review.createdAt);

  return (
    <View
      style={[
        styles.review,
        {
          backgroundColor: '#F8FBF9',
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.reviewTop}>
        <View style={styles.reviewRating}>
          <AppIcon
            name="star"
            size={iconSize.xs}
            color={theme.colors.warning}
            fill={theme.colors.warning}
          />

          <AppText variant="label">
            {review.rating.toFixed(1)}
          </AppText>
        </View>

        {date ? (
          <AppText variant="caption" muted>
            {date}
          </AppText>
        ) : null}
      </View>

      {review.comment ? (
        <AppText
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={styles.reviewComment}
        >
          {review.comment}
        </AppText>
      ) : (
        <AppText
          variant="caption"
          muted
          style={styles.reviewComment}
        >
          Rating submitted without a written comment.
        </AppText>
      )}
    </View>
  );
}

function ProviderDetailsSkeleton(): React.JSX.Element {
  return (
    <>
      <Card style={styles.heroCard}>
        <View style={styles.profileRow}>
          <Skeleton
            width={76}
            height={76}
            radiusValue={38}
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
          {[0, 1, 2, 3].map(index => (
            <Skeleton
              key={index}
              width="23%"
              height={66}
              radiusValue={14}
            />
          ))}
        </View>
      </Card>

      {[0, 1, 2].map(index => (
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
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
  },
  error: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  heroCard: {
    borderRadius: 22,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    flex: 1,
  },
  distance: {
    marginTop: spacing[1],
  },
  stats: {
    marginTop: spacing[5],
    flexDirection: 'row',
    gap: spacing[2],
  },
  stat: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginTop: 4,
  },
  statusRow: {
    marginTop: spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  sectionCard: {
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
  sectionText: {
    marginTop: spacing[3],
    lineHeight: 21,
  },
  serviceList: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  serviceRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  serviceCopy: {
    flex: 1,
    minWidth: 0,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  pricePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  emptyInset: {
    borderRadius: 14,
    padding: spacing[3],
  },
  reviewList: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  review: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing[3],
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reviewComment: {
    marginTop: spacing[2],
    lineHeight: 20,
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
