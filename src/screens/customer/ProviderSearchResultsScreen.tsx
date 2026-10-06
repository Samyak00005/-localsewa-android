import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  CustomerSearchBar,
  HomeProviderCard,
  ProviderListSkeleton,
} from '../../components/customer';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
} from '../../components/ui';
import {
  useCustomerProfile,
} from '../../hooks/useAccount';
import {
  useProviders,
  useRemoveSavedProvider,
  useSavedProviders,
  useSaveProvider,
} from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  Provider,
} from '../../types/provider';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'ProviderSearchResults'
  >;

export function ProviderSearchResultsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    data: profile,
  } = useCustomerProfile();

  const [input, setInput] =
    useState(
      route.params.query,
    );

  const [query, setQuery] =
    useState(
      route.params.query.trim(),
    );

  const [savingRef, setSavingRef] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    const nextQuery =
      route.params.query.trim();

    setInput(
      route.params.query,
    );
    setQuery(nextQuery);
  }, [route.params.query]);

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviders({
    q: query,
    latitude:
      profile?.latitude ??
      null,
    longitude:
      profile?.longitude ??
      null,
    limit: 150,
  });

  const {
    data: savedProviders = [],
  } = useSavedProviders();

  const saveProvider =
    useSaveProvider();

  const removeSaved =
    useRemoveSavedProvider();

  const savedIds =
    useMemo(
      () =>
        new Set(
          savedProviders.map(
            item =>
              item.id,
          ),
        ),
      [savedProviders],
    );

  const visibleProviders =
    useMemo(
      () =>
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
        ),
      [providers],
    );

  function submitSearch() {
    const nextQuery =
      input.trim();

    if (!nextQuery) {
      return;
    }

    setQuery(nextQuery);
  }

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

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}>
      <CustomerHeader
        routeName="CustomerHome"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppText variant="h1">
          Search results
        </AppText>

        <AppText
          variant="body"
          muted
          style={
            styles.subtitle
          }>
          Find providers, services and local professionals.
        </AppText>

        <CustomerSearchBar
          value={input}
          onChangeText={
            setInput
          }
          onSearch={
            submitSearch
          }
          placeholder="What service do you need?"
          style={
            styles.search
          }
        />

        <View
          style={
            styles.resultHeader
          }>
          <View
            style={
              styles.resultCopy
            }>
            <AppText variant="title">
              {query
                ? `Results for “${query}”`
                : 'Results'}
            </AppText>

            {!isLoading &&
            !error ? (
              <AppText
                variant="caption"
                muted
                style={
                  styles.resultCount
                }>
                {
                  visibleProviders.length
                }{' '}
                {visibleProviders.length ===
                1
                  ? 'provider'
                  : 'providers'}
              </AppText>
            ) : null}
          </View>
        </View>

        <View
          style={styles.list}>
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
                    navigation.navigate(
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
                    navigation.navigate(
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
                No matching providers
              </AppText>

              <AppText
                variant="bodySmall"
                muted
                style={
                  styles.emptyText
                }>
                Try another service, provider name or area.
              </AppText>
            </Card>
          )}
        </View>
      </ScrollView>

      <CustomerDetailBottomBar
        activeRoute="CustomerHome"
        onNavigate={tab =>
          navigation.navigate(
            'CustomerTabs',
            {
              screen: tab,
            },
          )
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[6],
      paddingBottom:
        spacing[10],
    },
    subtitle: {
      marginTop:
        spacing[2],
    },
    search: {
      marginTop:
        spacing[5],
    },
    resultHeader: {
      marginTop:
        spacing[6],
    },
    resultCopy: {
      flex: 1,
    },
    resultCount: {
      marginTop:
        spacing[1],
    },
    list: {
      marginTop:
        spacing[3],
      gap: spacing[4],
    },
    emptyText: {
      marginTop:
        spacing[2],
    },
  });
