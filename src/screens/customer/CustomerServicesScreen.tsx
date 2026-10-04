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
} from '../../components/customer';
import {
  AlertBanner,
  AppText,
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
  'CustomerServices'
>;

export function CustomerServicesScreen({
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
    isLoading:
      categoriesLoading,
  } = useCategories();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return providers;
      }

      return providers.filter(provider =>
        [
          provider.name,
          provider.category,
          provider.location,
          ...provider.services.map(
            service => service.name,
          ),
        ].some(value =>
          value
            .toLowerCase()
            .includes(query),
        ),
      );
    }, [providers, search]);

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
      <AppText variant="h1">
        Services
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Browse the active Localsewa service catalog and matching providers.
      </AppText>

      <View style={styles.search}>
        <Input
          placeholder="Search services or providers"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <Card style={styles.catalogCard}>
        <AppText variant="title">
          All service categories
        </AppText>

        <AppText
          variant="caption"
          muted
          style={styles.catalogText}>
          {categoriesLoading
            ? 'Loading active categories…'
            : `${categories.length} active categories returned by Localsewa.`}
        </AppText>

        <View style={styles.categoryList}>
          {categories.map(category => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              onPress={() =>
                setSearch(
                  category.name,
                )
              }
              style={[
                styles.category,
                {
                  borderColor:
                    theme.colors.border,
                  backgroundColor:
                    search
                      .toLowerCase() ===
                    category.name
                      .toLowerCase()
                      ? theme.colors.secondary
                      : theme.colors.surface,
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
      </Card>

      <View style={styles.providers}>
        <AppText variant="title">
          {search.trim()
            ? 'Matching providers'
            : 'Available providers'}
        </AppText>

        <View style={styles.list}>
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
          ) : filtered.length ? (
            [...filtered]
              .sort(
                (a, b) =>
                  Number(b.available) -
                  Number(a.available),
              )
              .map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onPress={() =>
                    stack?.navigate(
                      'ProviderDetails',
                      {
                        providerId:
                          provider.id,
                      },
                    )
                  }
                />
              ))
          ) : (
            <Card>
              <AppText variant="title">
                No providers found
              </AppText>
              <AppText
                variant="bodySmall"
                muted
                style={styles.catalogText}>
                This category may not have an active provider yet.
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
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  search: {
    marginTop: spacing[5],
  },
  catalogCard: {
    marginTop: spacing[6],
  },
  catalogText: {
    marginTop: spacing[2],
  },
  categoryList: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
  category: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  providers: {
    marginTop: spacing[8],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
