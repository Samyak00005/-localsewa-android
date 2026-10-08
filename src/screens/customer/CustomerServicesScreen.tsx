import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import {
  CustomerSearchBar,
  EmergencyServiceCard,
  HomeProviderCard,
  HomeServiceCard,
  ProviderListSkeleton,
} from '../../components/customer';
import { AppIcon, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
} from '../../components/ui';
import {
  useCategories,
  useProviders,
  useRemoveSavedProvider,
  useSavedProviders,
  useSaveProvider,
} from '../../hooks/useCustomerData';
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
import { ServiceCategory } from '../../types/category';
import { Provider } from '../../types/provider';

type Props = BottomTabScreenProps<
  CustomerTabParamList,
  'CustomerServices'
>;

type CategoryItem = ServiceCategory & {
  providerCount: number;
};

const CATEGORY_PAGE_SIZE = 8;
const PROVIDER_PAGE_SIZE = 4;

export function CustomerServicesScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const [search, setSearch] = useState('');
  const [categoryLimit, setCategoryLimit] =
    useState(CATEGORY_PAGE_SIZE);
  const [providerLimit, setProviderLimit] =
    useState(PROVIDER_PAGE_SIZE);
  const [savingRef, setSavingRef] =
    useState<string | null>(null);

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviders();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    refetch: refetchCategories,
    isRefetching: categoriesRefetching,
  } = useCategories();

  const {
    data: savedProviders = [],
    refetch: refetchSaved,
    isRefetching: savedRefetching,
  } = useSavedProviders();

  const saveProvider =
    useSaveProvider();

  const removeSaved =
    useRemoveSavedProvider();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const categoryItems = useMemo(
    () =>
      buildCategoryItems(
        categories,
        providers,
      ),
    [categories, providers],
  );

  const savedIds = useMemo(
    () =>
      new Set(
        savedProviders.map(
          item => item.id,
        ),
      ),
    [savedProviders],
  );

  const normalizedSearch =
    search.trim().toLowerCase();

  const matchingCategories =
    useMemo(() => {
      if (!normalizedSearch) {
        return categoryItems;
      }

      return categoryItems.filter(
        category =>
          category.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      categoryItems,
      normalizedSearch,
    ]);

  const visibleCategories =
    normalizedSearch
      ? matchingCategories
      : matchingCategories.slice(
          0,
          categoryLimit,
        );

  const filteredProviders =
    useMemo(() => {
      const source =
        [...providers].sort(
          (a, b) =>
            Number(
              b.available,
            ) -
              Number(
                a.available,
              ) ||
            Number(
              b.verified,
            ) -
              Number(
                a.verified,
              ) ||
            (b.rating ?? 0) -
              (a.rating ?? 0),
        );

      return source.filter(
        provider => {
          if (!normalizedSearch) {
            return true;
          }

          return [
            provider.name,
            provider.category,
            provider.location,
            ...provider.services.map(
              service =>
                service.name,
            ),
          ].some(value =>
            value
              .toLowerCase()
              .includes(
                normalizedSearch,
              ),
          );
        },
      );
    }, [
      normalizedSearch,
      providers,
    ]);

  const visibleProviders =
    filteredProviders.slice(
      0,
      providerLimit,
    );

  const canShowMoreCategories =
    !normalizedSearch &&
    categoryLimit <
      matchingCategories.length;

  const canShowFewerCategories =
    !normalizedSearch &&
    categoryLimit >
      CATEGORY_PAGE_SIZE;

  const canShowMoreProviders =
    providerLimit <
    filteredProviders.length;

  const canShowFewerProviders =
    providerLimit >
      PROVIDER_PAGE_SIZE;

  useEffect(() => {
    setProviderLimit(
      PROVIDER_PAGE_SIZE,
    );
  }, [
    normalizedSearch,
  ]);

  async function toggleSaved(
    provider: Provider,
  ) {
    if (savingRef) {
      return;
    }

    setSavingRef(
      provider.id,
    );

    try {
      if (
        savedIds.has(
          provider.id,
        )
      ) {
        await removeSaved.mutateAsync(
          provider.id,
        );
      } else {
        await saveProvider.mutateAsync(
          provider.id,
        );
      }
    } catch (
      mutationError
    ) {
      Alert.alert(
        'Saved providers',
        errorMessage(
          mutationError,
        ),
      );
    } finally {
      setSavingRef(null);
    }
  }

  async function refreshCustomerServices() {
    await Promise.all([
      refetch(),
      refetchCategories(),
      refetchSaved(),
    ]);
  }

  const customerServicesRefreshing =
    isRefetching || categoriesRefetching || savedRefetching;

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
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={customerServicesRefreshing}
          onRefresh={refreshCustomerServices}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.surface}
        />
      }>
      <View style={styles.intro}>
        <AppText variant="h1">
          All services
        </AppText>

        <AppText
          variant="body"
          muted
          style={
            styles.subtitle
          }>
          Browse every active Localsewa service and find matching local providers.
        </AppText>

        <CustomerSearchBar
          value={search}
          onChangeText={value => {
            setSearch(value);

            if (
              !value.trim()
            ) {
              setCategoryLimit(
                CATEGORY_PAGE_SIZE,
              );
            }
          }}
          placeholder="What service do you need?"
          style={styles.search}
        />

      </View>

      <View
        style={
          styles.categoriesSection
        }>
        <View
          style={
            styles.sectionHeader
          }>
          <View
            style={
              styles.sectionCopy
            }>
            <AppText variant="h2">
              Service categories
            </AppText>

            <AppText
              variant="caption"
              muted
              style={
                styles.sectionSubtitle
              }>
              {categoriesLoading
                ? 'Loading active categories…'
                : normalizedSearch
                  ? `${matchingCategories.length} matching categories`
                  : `Showing ${visibleCategories.length} of ${categoryItems.length}`}
            </AppText>
          </View>

          {normalizedSearch ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSearch('');
                setCategoryLimit(
                  CATEGORY_PAGE_SIZE,
                );
              }}
              style={
                styles.clearAction
              }>
              <AppText
                variant="label"
                color={
                  theme.colors.primary
                }>
                Clear search
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {categoriesLoading ? (
          <View
            style={
              styles.categoryLoading
            }>
            <Card
              style={
                styles.loadingCard
              }>
              <AppText
                variant="bodySmall"
                muted>
                Loading service catalog…
              </AppText>
            </Card>
          </View>
        ) : visibleCategories.length ? (
          <View
            style={
              styles.categoryGrid
            }>
            {pairCategories(
              visibleCategories,
            ).map(
              (
                row,
                rowIndex,
              ) => (
                <View
                  key={`category-row-${rowIndex}`}
                  style={
                    styles.categoryRow
                  }>
                  {row.map(
                    item => (
                      <HomeServiceCard
                        key={
                          item.id
                        }
                        slug={
                          item.slug
                        }
                        name={
                          item.name
                        }
                        providerCount={
                          item.providerCount
                        }
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
                    ),
                  )}

                  {row.length ===
                  1 ? (
                    <View
                      style={
                        styles.categorySpacer
                      }
                    />
                  ) : null}
                </View>
              ),
            )}
          </View>
        ) : (
          <Card
            style={
              styles.categoryEmpty
            }>
            <AppText variant="title">
              No matching service
            </AppText>

            <AppText
              variant="bodySmall"
              muted
              style={
                styles.sectionSubtitle
              }>
              Try another service name.
            </AppText>
          </Card>
        )}

        {!normalizedSearch &&
        (canShowMoreCategories ||
          canShowFewerCategories) ? (
          <View
            style={
              styles.categoryActions
            }>
            {canShowFewerCategories ? (
              <CompactAction
                label="Show fewer"
                icon="chevronUp"
                onPress={() =>
                  setCategoryLimit(
                    CATEGORY_PAGE_SIZE,
                  )
                }
              />
            ) : null}

            {canShowMoreCategories ? (
              <CompactAction
                label="Show more services"
                icon="chevronDown"
                onPress={() =>
                  setCategoryLimit(
                    current =>
                      Math.min(
                        current +
                          CATEGORY_PAGE_SIZE,
                        matchingCategories.length,
                      ),
                  )
                }
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <View
        style={
          styles.providersSection
        }>
        <View
          style={
            styles.providersHeading
          }>
          <View
            style={
              styles.sectionCopy
            }>
            <AppText variant="h2">
              {normalizedSearch
                ? 'Matching providers'
                : 'Available providers'}
            </AppText>

            <AppText
              variant="caption"
              muted
              style={
                styles.sectionSubtitle
              }>
              {filteredProviders.length}{' '}
              {filteredProviders.length ===
              1
                ? 'provider'
                : 'providers'}
              {' · '}
              available providers are shown first
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.list
          }>
          {isLoading ? (
            <ProviderListSkeleton />
          ) : error ? (
            <>
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
            </>
          ) : visibleProviders.length ? (
            visibleProviders.map(
              provider => (
                <HomeProviderCard
                  key={
                    provider.id
                  }
                  provider={
                    provider
                  }
                  saved={
                    savedIds.has(
                      provider.id,
                    )
                  }
                  saving={
                    savingRef ===
                    provider.id
                  }
                  onDetails={() =>
                    stack?.navigate(
                      'ProviderDetails',
                      {
                        providerId:
                          provider.id,
                      },
                    )
                  }
                  onToggleSaved={() =>
                    toggleSaved(
                      provider,
                    )
                  }
                  onBook={() =>
                    stack?.navigate(
                      'BookingRequest',
                      {
                        providerId:
                          provider.id,
                      },
                    )
                  }
                />
              ),
            )
          ) : (
            <Card>
              <AppText variant="title">
                No providers found
              </AppText>

              <AppText
                variant="bodySmall"
                muted
                style={
                  styles.sectionSubtitle
                }>
                This service may not have an active provider yet.
              </AppText>
            </Card>
          )}
        </View>

        {!isLoading &&
        !error &&
        filteredProviders.length >
          PROVIDER_PAGE_SIZE ? (
          <View
            style={
              styles.providerActions
            }>
            {canShowFewerProviders ? (
              <CompactAction
                label="Show fewer"
                icon="chevronUp"
                onPress={() =>
                  setProviderLimit(
                    PROVIDER_PAGE_SIZE,
                  )
                }
              />
            ) : null}

            {canShowMoreProviders ? (
              <CompactAction
                label="Load more providers"
                icon="chevronDown"
                onPress={() =>
                  setProviderLimit(
                    current =>
                      Math.min(
                        current +
                          PROVIDER_PAGE_SIZE,
                        filteredProviders.length,
                      ),
                  )
                }
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <View
        style={
          styles.emergencySection
        }>
        <EmergencyServiceCard
          onPress={() => {
            setSearch('');
            setCategoryLimit(
              CATEGORY_PAGE_SIZE,
            );
            setProviderLimit(
              PROVIDER_PAGE_SIZE,
            );
          }}
        />
      </View>
    </ScrollView>
  );
}

function CompactAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon:
    | 'chevronDown'
    | 'chevronUp';
  onPress: () => void;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.compactAction,
        {
          backgroundColor:
            pressed
              ? theme.colors.secondary
              : 'transparent',
          borderColor:
            '#BFE4CE',
        },
      ]}>
      <AppIcon
        name={icon}
        size={
          iconSize.xs
        }
        color={
          theme.colors.primary
        }
      />

      <AppText
        variant="label"
        color={
          theme.colors.primary
        }>
        {label}
      </AppText>
    </Pressable>
  );
}

function buildCategoryItems(
  categories: ServiceCategory[],
  providers: Provider[],
): CategoryItem[] {
  const counts =
    new Map<string, number>();

  providers.forEach(
    provider => {
      const key =
        provider.category
          .trim()
          .toLowerCase();

      counts.set(
        key,
        (counts.get(key) ??
          0) + 1,
      );
    },
  );

  return [...categories]
    .map(category => ({
      ...category,
      providerCount:
        counts.get(
          category.name
            .trim()
            .toLowerCase(),
        ) ?? 0,
    }))
    .sort(
      (a, b) =>
        Number(
          b.providerCount > 0,
        ) -
          Number(
            a.providerCount > 0,
          ) ||
        b.providerCount -
          a.providerCount ||
        a.name.localeCompare(
          b.name,
        ),
    );
}

function pairCategories(
  items: CategoryItem[],
): CategoryItem[][] {
  const rows:
    CategoryItem[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += 2
  ) {
    rows.push(
      items.slice(
        index,
        index + 2,
      ),
    );
  }

  return rows;
}

const styles =
  StyleSheet.create({
    content: {
      paddingBottom:
        spacing[12],
    },
    intro: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[6],
    },
    subtitle: {
      marginTop:
        spacing[2],
    },
    search: {
      marginTop:
        spacing[5],
    },
    categoriesSection: {
      paddingHorizontal:
        layout.screenHorizontal,
      marginTop: 36,
      gap: spacing[4],
    },
    sectionHeader: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    sectionCopy: {
      flex: 1,
    },
    sectionSubtitle: {
      marginTop:
        spacing[1],
    },
    clearAction: {
      minHeight: 36,
      justifyContent:
        'center',
      paddingHorizontal:
        spacing[2],
    },
    categoryGrid: {
      gap: spacing[3],
    },
    categoryRow: {
      flexDirection:
        'row',
      gap: spacing[3],
    },
    categorySpacer: {
      flex: 1,
      minWidth: 0,
    },
    categoryLoading: {
      gap: spacing[3],
    },
    loadingCard: {
      minHeight: 88,
      justifyContent:
        'center',
    },
    categoryEmpty: {
      minHeight: 104,
      justifyContent:
        'center',
    },
    categoryActions: {
      minHeight: 42,
      flexDirection:
        'row',
      justifyContent:
        'center',
      alignItems:
        'center',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    compactAction: {
      minHeight: 38,
      borderWidth: 1,
      borderRadius:
        radius.pill,
      paddingHorizontal:
        spacing[3],
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: spacing[2],
    },
    providersSection: {
      paddingHorizontal:
        layout.screenHorizontal,
      marginTop:
        spacing[8],
    },
    providersHeading: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    list: {
      gap: spacing[4],
      marginTop:
        spacing[4],
    },
    providerActions: {
      minHeight: 44,
      marginTop:
        spacing[4],
      flexDirection:
        'row',
      justifyContent:
        'center',
      alignItems:
        'center',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    emergencySection: {
      paddingHorizontal:
        layout.screenHorizontal,
      marginTop:
        spacing[8],
    },
  });
