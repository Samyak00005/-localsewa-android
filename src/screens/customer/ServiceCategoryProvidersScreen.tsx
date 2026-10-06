import React, {
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
    'ServiceCategoryProviders'
  >;

export function ServiceCategoryProvidersScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    categoryName,
  } = route.params;

  const {
    data: profile,
  } = useCustomerProfile();

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    savingRef,
    setSavingRef,
  ] =
    useState<string | null>(
      null,
    );

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviders({
    category:
      categoryName,
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
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const sorted =
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

      if (!query) {
        return sorted;
      }

      return sorted.filter(
        provider =>
          [
            provider.name,
            provider.location,
            ...provider.services.map(
              service =>
                service.name,
            ),
          ].some(value =>
            value
              .toLowerCase()
              .includes(
                query,
              ),
          ),
      );
    }, [
      providers,
      search,
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
        routeName="CustomerServices"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppText
          variant="overline"
          color={
            theme.colors.primary
          }>
          LOCAL SERVICES
        </AppText>

        <AppText
          variant="h1"
          style={
            styles.title
          }>
          {categoryName}
        </AppText>

        <AppText
          variant="body"
          muted
          style={
            styles.subtitle
          }>
          Find local providers offering {categoryName.toLowerCase()} services.
        </AppText>

        <CustomerSearchBar
          value={search}
          onChangeText={
            setSearch
          }
          placeholder={`Search ${categoryName} providers`}
          style={
            styles.search
          }
        />

        <View
          style={
            styles.resultHeader
          }>
          <AppText variant="title">
            Providers
          </AppText>

          {!isLoading &&
          !error ? (
            <AppText
              variant="caption"
              muted>
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
                No providers available yet
              </AppText>

              <AppText
                variant="bodySmall"
                muted
                style={
                  styles.emptyText
                }>
                There is currently no active {categoryName.toLowerCase()} provider in this service area.
              </AppText>
            </Card>
          )}
        </View>
      </ScrollView>

      <CustomerDetailBottomBar
        activeRoute="CustomerServices"
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
    title: {
      marginTop:
        spacing[1],
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
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: spacing[3],
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
