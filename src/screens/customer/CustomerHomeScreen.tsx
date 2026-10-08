import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAuth } from '../../auth';
import {
  CustomerLocationChip,
  CustomerSearchBar,
  EmergencyServiceCard,
  HomeProviderCard,
  HomeReviewCard,
  HomeServiceCard,
  ProviderListSkeleton,
} from '../../components/customer';
import { AppIcon, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { CUSTOMER_HOME_GREEN } from '../../constants/customerUi';
import { useCustomerProfile } from '../../hooks/useAccount';
import {
  useCategories,
  useProviders,
  useRemoveSavedProvider,
  useSavedProviders,
  useSaveProvider,
} from '../../hooks/useCustomerData';
import { useHomeReviews } from '../../hooks/useHomeReviews';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import { layout, radius, shadows, spacing, useAppTheme } from '../../theme';
import { ServiceCategory } from '../../types/category';
import { Provider } from '../../types/provider';

type Props = BottomTabScreenProps<CustomerTabParamList, 'CustomerHome'>;

const POPULAR_ORDER = [
  'Electrician',
  'Home Cleaning',
  'Dance Teacher',
  'Developer',
  'Plumber',
  'Carpenter',
];

export function CustomerHomeScreen({ navigation }: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const { height: windowHeight } = useWindowDimensions();

  const heroMinHeight = Math.min(
    286,
    Math.max(260, Math.round(windowHeight * 0.34)),
  );

  // Visual background only. This does NOT participate in layout,
  // so the location, title, search, trust row and following sections
  // keep the exact same positions as v1.10.33.
  const heroBackgroundHeight = Math.round(
    windowHeight * 0.4,
  );

  const { user } = useAuth();

  const stack =
    navigation.getParent<NativeStackNavigationProp<CustomerStackParamList>>();

  const {
    data: profile,
    refetch: refetchProfile,
    isRefetching: profileRefetching,
  } = useCustomerProfile();

  const [search, setSearch] = useState('');

  const [savingRef, setSavingRef] = useState<string | null>(null);

  const latitude = profile?.latitude ?? null;

  const longitude = profile?.longitude ?? null;

  const {
    data: providers = [],
    isLoading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
    isRefetching: providersRefetching,
  } = useProviders({
    latitude,
    longitude,
    limit: 150,
  });

  const {
    data: categories = [],
    refetch: refetchCategories,
    isRefetching: categoriesRefetching,
  } = useCategories();

  const {
    data: savedProviders = [],
    refetch: refetchSaved,
    isRefetching: savedRefetching,
  } = useSavedProviders();

  const saveProvider = useSaveProvider();

  const removeSaved = useRemoveSavedProvider();

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    refetch: refetchReviews,
    isRefetching: reviewsRefetching,
  } = useHomeReviews();

  const locationLabel =
    profile?.location ?? user?.location ?? 'Set your service location';

  const savedIds = useMemo(
    () => new Set(savedProviders.map(item => item.id)),
    [savedProviders],
  );

  const popularServices = useMemo(
    () => choosePopularServices(categories, providers),
    [categories, providers],
  );

  const visibleProviders = useMemo(() => {
    return [...providers]
      .sort(
        (a, b) =>
          Number(b.available) - Number(a.available) ||
          Number(b.verified) - Number(a.verified) ||
          (b.rating ?? 0) - (a.rating ?? 0),
      )
      .slice(0, 3);
  }, [providers]);

  function openProvider(providerId: string) {
    stack?.navigate('ProviderDetails', { providerId });
  }

  function bookProvider(providerId: string) {
    stack?.navigate('BookingRequest', { providerId });
  }

  function openLocation() {
    stack?.navigate('DefaultLocation');
  }

  function openSearchResults() {
    const query = search.trim();

    if (!query) {
      return;
    }

    stack?.navigate('ProviderSearchResults', { query });
  }

  async function toggleSaved(provider: Provider) {
    if (savingRef) {
      return;
    }

    setSavingRef(provider.id);

    try {
      if (savedIds.has(provider.id)) {
        await removeSaved.mutateAsync(provider.id);
      } else {
        await saveProvider.mutateAsync(provider.id);
      }
    } catch (mutationError) {
      Alert.alert('Saved providers', errorMessage(mutationError));
    } finally {
      setSavingRef(null);
    }
  }

  async function refreshCustomerHome() {
    await Promise.all([
      refetchProfile(),
      refetchProviders(),
      refetchCategories(),
      refetchSaved(),
      refetchReviews(),
    ]);
  }

  const homeRefreshing =
    profileRefetching ||
    providersRefetching ||
    categoriesRefetching ||
    savedRefetching ||
    reviewsRefetching;

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={homeRefreshing}
          onRefresh={refreshCustomerHome}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.surface}
        />
      }
    >
      <View
        pointerEvents="none"
        style={[
          styles.heroBackground,
          {
            height:
              heroBackgroundHeight,
          },
        ]}
      />

      <View style={[styles.hero, { minHeight: heroMinHeight }]}>
        <CustomerLocationChip
          label={locationLabel}
          onPress={openLocation}
        />

        <AppText variant="display" color="#FFFFFF" style={styles.heroTitle}>
          Local services,{'\n'}without the hassle.
        </AppText>

        <View style={styles.trustLine}>
          <AppIcon name="zap" size={14} color="#FFFFFF" />

          <AppText variant="overline" color="#FFFFFF">
            TRUSTED HELP, CLOSE TO HOME
          </AppText>
        </View>

        <AppText variant="body" color="#ECFFF4" style={styles.heroDescription}>
          Compare local professionals, request services and manage bookings
          in one place.
        </AppText>

        <CustomerSearchBar
          value={search}
          onChangeText={setSearch}
          onSearch={openSearchResults}
          placeholder="What service do you need?"
          style={styles.heroSearch}
        />

        <View style={styles.benefits}>
          <Benefit label="Private booking chat" />
          <Benefit label="Local profiles" />
          <Benefit label="Simple booking" />
        </View>
      </View>

      <View
            style={[
              styles.popularShell,
              {
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <SectionHeading
              title="Popular services"
              subtitle="Quick access to the most requested local services"
              action="See all"
              onPress={() => navigation.navigate('CustomerServices')}
            />

            <View style={styles.serviceGrid}>
              {pairServices(popularServices).map((row, rowIndex) => (
                <View key={`service-row-${rowIndex}`} style={styles.serviceRow}>
                  {row.map(item => (
                    <HomeServiceCard
                      key={item.id}
                      slug={item.slug}
                      name={item.name}
                      providerCount={item.providerCount}
                      onPress={() =>
                        stack?.navigate(
                          'ServiceCategoryProviders',
                          {
                            categoryName:
                              item.name,
                          },
                        )
                      }
                    />
                  ))}

                  {row.length === 1 ? (
                    <View style={styles.serviceSpacer} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>

      <View style={styles.emergencyWrap}>
        <EmergencyServiceCard
          onPress={() => navigation.navigate('CustomerServices')}
        />
      </View>

      <View style={styles.providersSection}>
        <View style={styles.locationOverline}>
          <AppIcon name="mapPin" size={12} color={theme.colors.accent} />

          <AppText
            variant="overline"
            color={theme.colors.accent}
            numberOfLines={2}
            style={styles.locationOverlineText}
          >
            {locationLabel.toUpperCase()}
          </AppText>
        </View>

        <SectionHeading
          title="Services near you"
          subtitle="Browse local providers and send a booking request"
          action="See all"
          onPress={() =>
            stack?.navigate(
              'NearbyServices',
            )
          }
        />

        <View style={styles.providerList}>
          {providersLoading ? (
            <ProviderListSkeleton />
          ) : providersError ? (
            <>
              <AlertBanner variant="error">
                {errorMessage(providersError)}
              </AlertBanner>

              <Button
                label="Retry"
                loading={providersRefetching}
                onPress={() => refetchProviders()}
                fullWidth
              />
            </>
          ) : visibleProviders.length ? (
            visibleProviders.map(provider => (
              <HomeProviderCard
                key={provider.id}
                provider={provider}
                saved={savedIds.has(provider.id)}
                saving={savingRef === provider.id}
                onDetails={() => openProvider(provider.id)}
                onToggleSaved={() => toggleSaved(provider)}
                onBook={() => bookProvider(provider.id)}
              />
            ))
          ) : (
            <Card>
              <AppText variant="title">No nearby providers yet</AppText>

              <AppText variant="bodySmall" muted style={styles.emptyText}>
                Try changing your location or browse All services.
              </AppText>
            </Card>
          )}
        </View>
      </View>

      {reviewsLoading || reviews.length > 0 ? (
        <View style={styles.reviewsSection}>
          <AppText variant="overline" color={theme.colors.accent}>
            REAL CUSTOMER REVIEWS
          </AppText>

          <AppText variant="h2" style={styles.reviewsTitle}>
            What customers are saying
          </AppText>

          {reviewsLoading ? (
            <View style={styles.reviewSkeletons}>
              <Skeleton width={216} height={176} radiusValue={radius.xl} />

              <Skeleton width={216} height={176} radiusValue={radius.xl} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewTrack}
            >
              {reviews.map(review => (
                <HomeReviewCard key={review.id} review={review} />
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Benefit({ label }: { label: string }): React.JSX.Element {
  return (
    <View style={styles.benefit}>
      <AppIcon name="checkCircle" size={12} color="#D9FFE8" />

      <AppText variant="caption" color="#F2FFF7" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
  onPress,
}: {
  title: string;
  subtitle: string;
  action?: string;
  onPress?: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        <AppText variant="h2">{title}</AppText>

        <AppText variant="caption" muted style={styles.sectionSubtitle}>
          {subtitle}
        </AppText>
      </View>

      {action && onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [
            styles.seeAll,
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <AppText variant="label" color={theme.colors.primary}>
            {action}
          </AppText>

          <AppIcon
            name="arrowRight"
            size={iconSize.xs}
            color={theme.colors.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

type PopularService = ServiceCategory & {
  providerCount: number;
};

function pairServices(items: PopularService[]): PopularService[][] {
  const rows: PopularService[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return rows;
}

function choosePopularServices(
  categories: ServiceCategory[],
  providers: Provider[],
): PopularService[] {
  const providerCountByCategory = new Map<string, number>();

  providers.forEach(provider => {
    const key = provider.category.trim().toLowerCase();

    providerCountByCategory.set(
      key,
      (providerCountByCategory.get(key) ?? 0) + 1,
    );
  });

  const source = categories.length
    ? categories
    : Array.from(new Set(providers.map(provider => provider.category))).map(
        (name, index) => ({
          id: 900000 + index,
          slug: name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
          name,
        }),
      );

  const ordered = [...source].sort((a, b) => {
    const aIndex = POPULAR_ORDER.findIndex(
      value => value.toLowerCase() === a.name.toLowerCase(),
    );

    const bIndex = POPULAR_ORDER.findIndex(
      value => value.toLowerCase() === b.name.toLowerCase(),
    );

    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }

    const countA = providerCountByCategory.get(a.name.toLowerCase()) ?? 0;

    const countB = providerCountByCategory.get(b.name.toLowerCase()) ?? 0;

    return countB - countA;
  });

  return ordered.slice(0, 6).map(category => ({
    ...category,
    providerCount:
      providerCountByCategory.get(category.name.trim().toLowerCase()) ?? 0,
  }));
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[12],
    position: 'relative',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: CUSTOMER_HOME_GREEN,
  },
  hero: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 16,
    justifyContent: 'flex-start',
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 29,
    lineHeight: 31,
    letterSpacing: -0.35,
  },
  trustLine: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  heroDescription: {
    marginTop: 8,
    maxWidth: 340,
    fontSize: 13.5,
    lineHeight: 18,
  },
  heroSearch: {
    marginTop: 10,
  },
  benefits: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  popularShell: {
    marginTop: spacing[3],
    marginHorizontal: spacing[3],
    borderRadius: radius.sheet,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
    paddingBottom: spacing[5],
    ...shadows.md,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  sectionHeadingCopy: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing[1],
  },
  seeAll: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  serviceGrid: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  serviceRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  serviceSpacer: {
    flex: 1,
    minWidth: 0,
  },
  emergencyWrap: {
    paddingHorizontal: layout.screenHorizontal,
    marginTop: spacing[6],
  },
  providersSection: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
    backgroundColor: '#F8FBF9',
  },
  locationOverline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  locationOverlineText: {
    flex: 1,
    letterSpacing: 1.1,
  },
  providerList: {
    gap: spacing[4],
    marginTop: spacing[5],
  },
  emptyText: {
    marginTop: spacing[2],
  },
  reviewsSection: {
    backgroundColor: '#EAF8F0',
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
    paddingHorizontal: layout.screenHorizontal,
    overflow: 'hidden',
  },
  reviewsTitle: {
    marginTop: spacing[2],
  },
  reviewTrack: {
    gap: spacing[3],
    paddingTop: spacing[5],
    paddingRight: spacing[4],
  },
  reviewSkeletons: {
    marginTop: spacing[5],
    flexDirection: 'row',
    gap: spacing[3],
  },
});
