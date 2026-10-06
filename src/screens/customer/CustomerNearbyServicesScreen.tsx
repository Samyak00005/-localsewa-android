import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { errorMessage } from '../../api/apiClient';
import {
  CustomerLocationChip,
  CustomerSearchBar,
  HomeProviderCard,
  ProviderListSkeleton,
} from '../../components/customer';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import { AlertBanner, AppText, Button, Card } from '../../components/ui';
import { useCustomerProfile } from '../../hooks/useAccount';
import {
  useProviders,
  useRemoveSavedProvider,
  useSavedProviders,
  useSaveProvider,
} from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { layout, spacing, useAppTheme } from '../../theme';
import { Provider } from '../../types/provider';

type Props = NativeStackScreenProps<CustomerStackParamList, 'NearbyServices'>;

function distanceKm(label?: string): number {
  if (!label) {
    return Number.POSITIVE_INFINITY;
  }

  const match = /([\d.]+)\s*km/i.exec(label);
  const parsed = match ? Number(match[1]) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export function CustomerNearbyServicesScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const { data: profile } = useCustomerProfile();

  const [search, setSearch] = useState('');
  const [savingRef, setSavingRef] = useState<string | null>(null);

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviders({
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
    limit: 150,
  });

  const { data: savedProviders = [] } = useSavedProviders();
  const saveProvider = useSaveProvider();
  const removeSaved = useRemoveSavedProvider();

  const savedIds = useMemo(
    () => new Set(savedProviders.map(item => item.id)),
    [savedProviders],
  );

  const visibleProviders = useMemo(() => {
    const query = search.trim().toLowerCase();

    const sorted = [...providers].sort(
      (a, b) =>
        Number(b.available) - Number(a.available) ||
        distanceKm(a.distanceLabel) - distanceKm(b.distanceLabel) ||
        (b.rating ?? 0) - (a.rating ?? 0),
    );

    if (!query) {
      return sorted;
    }

    return sorted.filter(provider =>
      [
        provider.name,
        provider.category,
        provider.location,
        ...provider.services.map(service => service.name),
      ].some(value => value.toLowerCase().includes(query)),
    );
  }, [providers, search]);

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

  const locationLabel = profile?.location ?? 'Set your service location';

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <CustomerHeader routeName="CustomerHome" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="h1">Services near you</AppText>

        <AppText variant="body" muted style={styles.subtitle}>
          Local providers around your saved service area.
        </AppText>

        <CustomerLocationChip
          label={locationLabel}
          onPress={() =>
            navigation.navigate(
              'DefaultLocation',
            )
          }
          style={styles.locationChip}
        />

        <CustomerSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search nearby providers or services"
          style={styles.search}
        />

        <View style={styles.resultHeader}>
          <AppText variant="title">Nearby providers</AppText>

          {!isLoading && !error ? (
            <AppText variant="caption" muted>
              {visibleProviders.length} shown
            </AppText>
          ) : null}
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
          ) : visibleProviders.length ? (
            visibleProviders.map(provider => (
              <HomeProviderCard
                key={provider.id}
                provider={provider}
                saved={savedIds.has(provider.id)}
                saving={savingRef === provider.id}
                onDetails={() =>
                  navigation.navigate('ProviderDetails', {
                    providerId: provider.id,
                  })
                }
                onToggleSaved={() => toggleSaved(provider)}
                onBook={() =>
                  navigation.navigate('BookingRequest', {
                    providerId: provider.id,
                  })
                }
              />
            ))
          ) : (
            <Card>
              <AppText variant="title">No nearby providers found</AppText>

              <AppText variant="bodySmall" muted style={styles.emptyText}>
                Try changing your service location or search for another service.
              </AppText>
            </Card>
          )}
        </View>
      </ScrollView>

      <CustomerDetailBottomBar
        activeRoute="CustomerHome"
        onNavigate={tab =>
          navigation.navigate('CustomerTabs', {
            screen: tab,
          })
        }
      />
    </View>
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
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  locationChip: {
    marginTop: spacing[4],
  },
  search: {
    marginTop: spacing[3],
  },
  resultHeader: {
    marginTop: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  list: {
    marginTop: spacing[3],
    gap: spacing[4],
  },
  emptyText: {
    marginTop: spacing[2],
  },
});
