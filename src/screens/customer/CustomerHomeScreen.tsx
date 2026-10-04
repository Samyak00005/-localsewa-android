import React, {
  useMemo,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  ProviderCard,
  ProviderListSkeleton,
  SectionHeader,
} from '../../components/customer';
import {
  AlertBanner,
  AppText,
  Badge,
  Button,
  Card,
  Input,
} from '../../components/ui';
import {
  useCategories,
  useProviders,
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

type Props = BottomTabScreenProps<
  CustomerTabParamList,
  'CustomerHome'
>;

export function CustomerHomeScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();
  const [search, setSearch] =
    useState('');

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviders();

  const {
    data: categories = [],
  } = useCategories();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const filteredProviders =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      const source =
        [...providers].sort(
          (a, b) =>
            Number(b.available) -
              Number(a.available) ||
            (b.rating ?? 0) -
              (a.rating ?? 0),
        );

      if (!query) {
        return source.slice(0, 6);
      }

      return source
        .filter(provider =>
          [
            provider.name,
            provider.category,
            provider.location,
          ].some(value =>
            value
              .toLowerCase()
              .includes(query),
          ),
        )
        .slice(0, 20);
    }, [providers, search]);

  function openProvider(
    providerId: string,
  ) {
    stack?.navigate(
      'ProviderDetails',
      {providerId},
    );
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
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View
        style={[
          styles.hero,
          {
            backgroundColor:
              theme.colors.primary,
          },
        ]}>
        <Badge>LOCALSEWA</Badge>

        <AppText
          variant="h1"
          color="#FFFFFF"
          style={styles.heroTitle}>
          Trusted help, close to home.
        </AppText>

        <AppText
          variant="body"
          color="#E7F6ED"
          style={styles.heroText}>
          Find available local professionals and compare real service
          providers in one place.
        </AppText>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor:
                theme.colors.surface,
            },
          ]}>
          <Input
            placeholder="Search provider, service or area"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Popular services"
          subtitle="Active Localsewa service categories."
          actionLabel="See all"
          onAction={() =>
            navigation.navigate(
              'CustomerServices',
            )
          }
        />

        <View style={styles.chips}>
          {categories
            .slice(0, 10)
            .map(category => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                onPress={() => {
                  setSearch(
                    category.name,
                  );
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      theme.colors.secondary,
                  },
                ]}>
                <AppText
                  variant="label"
                  color={
                    theme.colors.primary
                  }>
                  {category.name}
                </AppText>
              </Pressable>
            ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={
            search.trim()
              ? 'Search results'
              : 'Providers to explore'
          }
          subtitle={
            search.trim()
              ? `${filteredProviders.length} matching providers`
              : 'Available providers are shown first.'
          }
        />

        <View style={styles.providerList}>
          {isLoading ? (
            <ProviderListSkeleton />
          ) : error ? (
            <>
              <AlertBanner variant="error">
                {errorMessage(error)}
              </AlertBanner>

              <Button
                label="Retry"
                loading={isRefetching}
                onPress={() => {
                  refetch();
                }}
                fullWidth
              />
            </>
          ) : filteredProviders.length ? (
            filteredProviders.map(
              provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onPress={() =>
                    openProvider(
                      provider.id,
                    )
                  }
                />
              ),
            )
          ) : (
            <Card>
              <AppText variant="title">
                No matches found
              </AppText>

              <AppText
                variant="bodySmall"
                muted
                style={styles.emptyText}>
                Try another service, provider name or area.
              </AppText>
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[12],
  },
  hero: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[7],
    paddingBottom: spacing[6],
  },
  heroTitle: {
    marginTop: spacing[4],
    maxWidth: 330,
  },
  heroText: {
    marginTop: spacing[2],
    maxWidth: 340,
  },
  searchWrap: {
    marginTop: spacing[5],
    borderRadius: radius.lg,
    padding: spacing[2],
  },
  section: {
    paddingHorizontal:
      layout.screenHorizontal,
    marginTop: spacing[8],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  providerList: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  emptyText: {
    marginTop: spacing[2],
  },
});
