import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import {
  CustomerSearchBar,
  EmergencyServiceCard,
  HomeServiceCard,
  ProviderCard,
  ProviderListSkeleton,
} from '../../components/customer';
import { AppIcon, iconSize } from '../../components/icons';
import { AlertBanner, AppText, Button, Card } from '../../components/ui';
import { useCategories, useProviders } from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { ServiceCategory } from '../../types/category';
import { Provider } from '../../types/provider';

type Props = BottomTabScreenProps<CustomerTabParamList, 'CustomerServices'>;

type CategoryItem = ServiceCategory & {
  providerCount: number;
};

const CATEGORY_PAGE_SIZE = 10;

export function CustomerServicesScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const [search, setSearch] = useState('');

  const [categoryLimit, setCategoryLimit] = useState(CATEGORY_PAGE_SIZE);

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviders();

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const stack =
    navigation.getParent<NativeStackNavigationProp<CustomerStackParamList>>();

  const categoryItems = useMemo(
    () => buildCategoryItems(categories, providers),
    [categories, providers],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const matchingCategories = useMemo(() => {
    if (!normalizedSearch) {
      return categoryItems;
    }

    return categoryItems.filter(category =>
      category.name.toLowerCase().includes(normalizedSearch),
    );
  }, [categoryItems, normalizedSearch]);

  const visibleCategories = normalizedSearch
    ? matchingCategories
    : matchingCategories.slice(0, categoryLimit);

  const filteredProviders = useMemo(() => {
    const source = [...providers].sort(
      (a, b) =>
        Number(b.available) - Number(a.available) ||
        (b.rating ?? 0) - (a.rating ?? 0),
    );

    if (!normalizedSearch) {
      return source;
    }

    return source.filter(provider =>
      [
        provider.name,
        provider.category,
        provider.location,
        ...provider.services.map(service => service.name),
      ].some(value => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [normalizedSearch, providers]);

  const canShowMore =
    !normalizedSearch && categoryLimit < matchingCategories.length;

  const canShowLess = !normalizedSearch && categoryLimit > CATEGORY_PAGE_SIZE;

  function selectCategory(name: string) {
    setSearch(name);
  }

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <AppText variant="h1">All services</AppText>

        <AppText variant="body" muted style={styles.subtitle}>
          Browse every active Localsewa service and find matching local
          providers.
        </AppText>

        <CustomerSearchBar
          value={search}
          onChangeText={value => {
            setSearch(value);
            if (!value.trim()) {
              setCategoryLimit(CATEGORY_PAGE_SIZE);
            }
          }}
          placeholder="What service do you need?"
          style={styles.search}
        />
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <AppText variant="h2">Service categories</AppText>

            <AppText variant="caption" muted style={styles.sectionSubtitle}>
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
                setCategoryLimit(CATEGORY_PAGE_SIZE);
              }}
              style={styles.clearAction}
            >
              <AppText variant="label" color={theme.colors.primary}>
                Clear
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {categoriesLoading ? (
          <View style={styles.categoryLoading}>
            <Card style={styles.loadingCard}>
              <AppText variant="bodySmall" muted>
                Loading service catalog…
              </AppText>
            </Card>
          </View>
        ) : visibleCategories.length ? (
          <View style={styles.categoryGrid}>
            {pairCategories(visibleCategories).map((row, rowIndex) => (
              <View key={`category-row-${rowIndex}`} style={styles.categoryRow}>
                {row.map(item => (
                  <HomeServiceCard
                    key={item.id}
                    name={item.name}
                    providerCount={item.providerCount}
                    onPress={() => selectCategory(item.name)}
                  />
                ))}

                {row.length === 1 ? (
                  <View style={styles.categorySpacer} />
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Card style={styles.categoryEmpty}>
            <AppText variant="title">No matching service</AppText>

            <AppText variant="bodySmall" muted style={styles.sectionSubtitle}>
              Try another service name.
            </AppText>
          </Card>
        )}

        {canShowMore ? (
          <Button
            label="Show more services"
            icon="chevronDown"
            variant="outline"
            onPress={() =>
              setCategoryLimit(current =>
                Math.min(
                  current + CATEGORY_PAGE_SIZE,
                  matchingCategories.length,
                ),
              )
            }
            fullWidth
          />
        ) : null}

        {canShowLess ? (
          <Button
            label="Show fewer services"
            icon="chevronUp"
            variant="ghost"
            onPress={() => setCategoryLimit(CATEGORY_PAGE_SIZE)}
            fullWidth
          />
        ) : null}
      </View>

      <View style={styles.providersSection}>
        <View style={styles.providersHeading}>
          <View style={styles.sectionCopy}>
            <AppText variant="h2">
              {normalizedSearch ? 'Matching providers' : 'Available providers'}
            </AppText>

            <AppText variant="caption" muted style={styles.sectionSubtitle}>
              {filteredProviders.length}{' '}
              {filteredProviders.length === 1 ? 'provider' : 'providers'}
              {' · '}
              available providers are shown first
            </AppText>
          </View>

          <View
            style={[
              styles.providerCount,
              {
                backgroundColor: theme.colors.secondary,
              },
            ]}
          >
            <AppIcon
              name="user"
              size={iconSize.xs}
              color={theme.colors.primary}
            />

            <AppText variant="label" color={theme.colors.primary}>
              {filteredProviders.length}
            </AppText>
          </View>
        </View>

        <View style={styles.list}>
          {isLoading ? (
            <ProviderListSkeleton />
          ) : error ? (
            <>
              <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>

              <Button
                label="Retry"
                loading={isRefetching}
                onPress={() => refetch()}
                fullWidth
              />
            </>
          ) : filteredProviders.length ? (
            filteredProviders.map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onPress={() =>
                  stack?.navigate('ProviderDetails', {
                    providerId: provider.id,
                  })
                }
              />
            ))
          ) : (
            <Card>
              <AppText variant="title">No providers found</AppText>

              <AppText variant="bodySmall" muted style={styles.sectionSubtitle}>
                This service may not have an active provider yet.
              </AppText>
            </Card>
          )}
        </View>
      </View>

      <View style={styles.emergencySection}>
        <EmergencyServiceCard
          onPress={() => {
            setSearch('');
            setCategoryLimit(CATEGORY_PAGE_SIZE);
          }}
        />
      </View>
    </ScrollView>
  );
}

function buildCategoryItems(
  categories: ServiceCategory[],
  providers: Provider[],
): CategoryItem[] {
  const counts = new Map<string, number>();

  providers.forEach(provider => {
    const key = provider.category.trim().toLowerCase();

    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...categories]
    .map(category => ({
      ...category,
      providerCount: counts.get(category.name.trim().toLowerCase()) ?? 0,
    }))
    .sort(
      (a, b) =>
        Number(b.providerCount > 0) - Number(a.providerCount > 0) ||
        b.providerCount - a.providerCount ||
        a.name.localeCompare(b.name),
    );
}

function pairCategories(items: CategoryItem[]): CategoryItem[][] {
  const rows: CategoryItem[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return rows;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[12],
  },
  intro: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  search: {
    marginTop: spacing[5],
  },
  categoriesSection: {
    paddingHorizontal: layout.screenHorizontal,
    marginTop: spacing[8],
    gap: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  sectionCopy: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing[1],
  },
  clearAction: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  categoryGrid: {
    gap: spacing[3],
  },
  categoryRow: {
    flexDirection: 'row',
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
    justifyContent: 'center',
  },
  categoryEmpty: {
    minHeight: 104,
    justifyContent: 'center',
  },
  providersSection: {
    paddingHorizontal: layout.screenHorizontal,
    marginTop: spacing[9],
  },
  providersHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  providerCount: {
    minWidth: 48,
    height: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  emergencySection: {
    paddingHorizontal: layout.screenHorizontal,
    marginTop: spacing[9],
  },
});
