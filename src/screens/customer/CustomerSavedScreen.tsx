import React from 'react';
import {
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
} from '../../components/ui';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';
import {
  CustomerStackParamList,
  CustomerTabParamList,
} from '../../navigation/types';
import {useSavedProviders} from '../../hooks/useCustomerData';

type Props = BottomTabScreenProps<
  CustomerTabParamList,
  'CustomerSaved'
>;

export function CustomerSavedScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSavedProviders();

  const stack =
    navigation.getParent<
      NativeStackNavigationProp<CustomerStackParamList>
    >();

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
      <AppText variant="h1">
        Saved providers
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Professionals saved to your Localsewa account.
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
        ) : data.length ? (
          data.map(provider => (
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
              No saved providers yet
            </AppText>

            <AppText
              variant="bodySmall"
              muted
              style={styles.subtitle}>
              Providers you save will appear here.
            </AppText>
          </Card>
        )}
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
  list: {
    gap: spacing[3],
    marginTop: spacing[6],
  },
});
