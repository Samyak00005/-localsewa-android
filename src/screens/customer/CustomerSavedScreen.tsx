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
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  SavedProviderCard,
} from '../../components/customer';
import {
  AppIcon,
  iconSize,
} from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import {
  useRemoveSavedProvider,
  useSavedProviders,
} from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
  CustomerTabParamList,
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
  BottomTabScreenProps<
    CustomerTabParamList,
    'CustomerSaved'
  >;

export function CustomerSavedScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const [
    removingId,
    setRemovingId,
  ] =
    useState<string | null>(
      null,
    );

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSavedProviders();

  const removeSaved =
    useRemoveSavedProvider();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

  const providers =
    useMemo(
      () =>
        [...data].sort(
          (a, b) =>
            Number(
              b.available,
            ) -
              Number(
                a.available,
              ) ||
            (b.rating ?? 0) -
              (a.rating ?? 0) ||
            a.name.localeCompare(
              b.name,
            ),
        ),
      [data],
    );

  async function remove(
    provider: Provider,
  ) {
    if (removingId) {
      return;
    }

    setRemovingId(
      provider.id,
    );

    try {
      await removeSaved.mutateAsync(
        provider.id,
      );
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
      setRemovingId(
        null,
      );
    }
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
      showsVerticalScrollIndicator={false}>
      <View
        style={
          styles.headingRow
        }>
        <View
          style={
            styles.headingCopy
          }>
          <AppText variant="h1">
            Saved providers
          </AppText>

          <AppText
            variant="body"
            muted
            style={
              styles.subtitle
            }>
            Keep your preferred local professionals ready for the next booking.
          </AppText>
        </View>


      </View>

      <View
        style={
          styles.list
        }>
        {isLoading ? (
          <SavedProvidersSkeleton />
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
        ) : providers.length ? (
          providers.map(
            provider => (
              <SavedProviderCard
                key={
                  provider.id
                }
                provider={
                  provider
                }
                removing={
                  removingId ===
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
                onRemove={() =>
                  remove(
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
          <EmptySaved
            onBrowse={() =>
              navigation.navigate(
                'CustomerServices',
              )
            }
          />
        )}
      </View>
    </ScrollView>
  );
}

function EmptySaved({
  onBrowse,
}: {
  onBrowse: () => void;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <Card
      style={
        styles.emptyCard
      }>
      <View
        style={[
          styles.emptyIcon,
          {
            backgroundColor:
              theme.colors.secondary,
          },
        ]}>
        <AppIcon
          name="bookmark"
          size={
            iconSize.lg
          }
          color={
            theme.colors.primary
          }
        />
      </View>

      <AppText
        variant="title"
        style={
          styles.emptyTitle
        }>
        No saved providers yet
      </AppText>

      <AppText
        variant="bodySmall"
        muted
        style={
          styles.emptyText
        }>
        Save providers you may want to contact or book again later.
      </AppText>

      <View
        style={
          styles.emptyAction
        }>
        <Button
          label="Browse all services"
          icon="servicesGrid"
          onPress={
            onBrowse
          }
          fullWidth
        />
      </View>
    </Card>
  );
}

function SavedProvidersSkeleton(): React.JSX.Element {
  return (
    <>
      {[0, 1, 2].map(
        index => (
          <Card
            key={index}
            style={
              styles.skeletonCard
            }>
            <View
              style={
                styles.skeletonTop
              }>
              <Skeleton
                width={54}
                height={54}
                radiusValue={27}
              />

              <View
                style={
                  styles.skeletonCopy
                }>
                <Skeleton
                  width="58%"
                  height={17}
                />

                <Skeleton
                  width="42%"
                  height={13}
                  style={
                    styles.skeletonGap
                  }
                />

                <Skeleton
                  width="72%"
                  height={12}
                  style={
                    styles.skeletonGap
                  }
                />
              </View>
            </View>

            <View
              style={
                styles.skeletonTiles
              }>
              <Skeleton
                width="31%"
                height={54}
                radiusValue={12}
              />

              <Skeleton
                width="31%"
                height={54}
                radiusValue={12}
              />

              <Skeleton
                width="31%"
                height={54}
                radiusValue={12}
              />
            </View>

            <Skeleton
              width="100%"
              height={44}
              radiusValue={22}
              style={
                styles.skeletonLargeGap
              }
            />
          </Card>
        ),
      )}
    </>
  );
}

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[6],
      paddingBottom:
        spacing[12],
    },
    headingRow: {
      alignItems:
        'stretch',
    },
    headingCopy: {
      flex: 1,
    },
    subtitle: {
      marginTop:
        spacing[2],
    },
    list: {
      gap: spacing[4],
      marginTop:
        spacing[6],
    },
    emptyCard: {
      borderRadius: 22,
      alignItems:
        'center',
      paddingVertical:
        spacing[7],
    },
    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    emptyTitle: {
      marginTop:
        spacing[4],
      textAlign: 'center',
    },
    emptyText: {
      marginTop:
        spacing[2],
      textAlign: 'center',
      maxWidth: 280,
    },
    emptyAction: {
      width: '100%',
      marginTop:
        spacing[5],
    },
    skeletonCard: {
      borderRadius: 22,
    },
    skeletonTop: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[3],
    },
    skeletonCopy: {
      flex: 1,
    },
    skeletonGap: {
      marginTop:
        spacing[2],
    },
    skeletonTiles: {
      marginTop:
        spacing[4],
      flexDirection: 'row',
      justifyContent:
        'space-between',
    },
    skeletonLargeGap: {
      marginTop:
        spacing[4],
    },
  });
