import React from 'react';
import {
  Image,
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
  useProviderDetails,
} from '../../hooks/useCustomerData';
import {
  AlertBanner,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Skeleton,
} from '../../components/ui';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'ProviderDetails'
  >;

function money(
  value?: number,
): string | null {
  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return `₹${Math.round(
    value,
  ).toLocaleString('en-IN')}`;
}

export function ProviderDetailsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();

  const {
    data: provider,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviderDetails(
    route.params.providerId,
  );

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Card style={styles.heroCard}>
            <Skeleton
              width={88}
              height={88}
              radiusValue={22}
            />

            <Skeleton
              width="72%"
              height={26}
              style={styles.skeletonGap}
            />

            <Skeleton
              width="55%"
              height={16}
              style={styles.skeletonGap}
            />

            <Skeleton
              width="100%"
              height={90}
              style={styles.skeletonGap}
            />
          </Card>
        ) : error || !provider ? (
          <View style={styles.error}>
            <AlertBanner variant="error">
              {errorMessage(
                error ??
                  new Error(
                    'Provider could not be loaded.',
                  ),
              )}
            </AlertBanner>

            <Button
              label="Retry"
              loading={isRefetching}
              onPress={() => {
                refetch();
              }}
              fullWidth
            />
          </View>
        ) : (
          <>
            <Card style={styles.heroCard}>
              <View style={styles.profileRow}>
                {provider.imageUrl ? (
                  <Image
                    source={{
                      uri:
                        provider.imageUrl,
                    }}
                    style={styles.image}
                  />
                ) : (
                  <Avatar
                    initials={
                      provider.name
                    }
                    size="lg"
                  />
                )}

                <View style={styles.profileCopy}>
                  <View style={styles.nameRow}>
                    <AppText
                      variant="h2"
                      style={styles.name}>
                      {provider.name}
                    </AppText>

                    {provider.verified ? (
                      <Badge variant="success">
                        VERIFIED
                      </Badge>
                    ) : null}
                  </View>

                  <AppText
                    variant="body"
                    color={
                      theme.colors.primary
                    }>
                    {provider.category}
                  </AppText>

                  <AppText
                    variant="caption"
                    muted
                    style={styles.smallGap}>
                    {provider.location}
                  </AppText>
                </View>
              </View>

              <View style={styles.stats}>
                <Stat
                  label="Rating"
                  value={
                    provider.rating ==
                    null
                      ? 'New'
                      : provider.rating.toFixed(
                          1,
                        )
                  }
                />

                <Stat
                  label="Reviews"
                  value={String(
                    provider.reviewCount,
                  )}
                />

                <Stat
                  label="Experience"
                  value={`${provider.experienceYears} yr`}
                />

                <Stat
                  label="Services"
                  value={String(
                    provider.serviceCount,
                  )}
                />
              </View>

              <View style={styles.badges}>
                <Badge
                  variant={
                    provider.available
                      ? 'success'
                      : 'default'
                  }>
                  {provider.available
                    ? 'AVAILABLE'
                    : 'UNAVAILABLE'}
                </Badge>

                {provider.homeService ? (
                  <Badge>
                    HOME SERVICE
                  </Badge>
                ) : null}

                {provider.shopService ? (
                  <Badge>
                    SHOP SERVICE
                  </Badge>
                ) : null}
              </View>
            </Card>

            {provider.description ? (
              <Card style={styles.sectionCard}>
                <AppText variant="title">
                  About
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  style={styles.sectionText}>
                  {provider.description}
                </AppText>
              </Card>
            ) : null}

            <Card style={styles.sectionCard}>
              <AppText variant="title">
                Services
              </AppText>

              <View style={styles.serviceList}>
                {provider.services.length ? (
                  provider.services.map(
                    (
                      service,
                      index,
                    ) => (
                      <React.Fragment
                        key={service.id}>
                        <View style={styles.serviceRow}>
                          <View style={styles.serviceCopy}>
                            <AppText variant="label">
                              {service.name}
                            </AppText>

                            {service.description ? (
                              <AppText
                                variant="caption"
                                muted
                                style={styles.smallGap}>
                                {service.description}
                              </AppText>
                            ) : null}
                          </View>

                          {money(
                            service.price,
                          ) ? (
                            <AppText
                              variant="label"
                              color={
                                theme.colors.primary
                              }>
                              {money(
                                service.price,
                              )}
                            </AppText>
                          ) : null}
                        </View>

                        {index <
                        provider.services
                          .length -
                          1 ? (
                          <Divider />
                        ) : null}
                      </React.Fragment>
                    ),
                  )
                ) : (
                  <AppText
                    variant="bodySmall"
                    muted>
                    This provider does not currently have a published service
                    list. You can still send a custom service request.
                  </AppText>
                )}
              </View>
            </Card>

            <Card style={styles.sectionCard}>
              <AppText variant="title">
                Reviews
              </AppText>

              <View style={styles.reviewList}>
                {provider.reviews.length ? (
                  provider.reviews
                    .slice(0, 5)
                    .map(review => (
                      <View
                        key={review.id}
                        style={styles.review}>
                        <AppText variant="label">
                          ★ {review.rating.toFixed(1)}
                        </AppText>

                        {review.comment ? (
                          <AppText
                            variant="bodySmall"
                            muted
                            style={styles.smallGap}>
                            {review.comment}
                          </AppText>
                        ) : null}
                      </View>
                    ))
                ) : (
                  <AppText
                    variant="bodySmall"
                    muted>
                    No written reviews yet.
                  </AppText>
                )}
              </View>
            </Card>

            <Card style={styles.bookingCard}>
              <AppText variant="title">
                Need this provider?
              </AppText>

              <AppText
                variant="bodySmall"
                muted>
                Choose a service, verify the job address and send a booking
                request.
              </AppText>

              <Button
                label={
                  provider.available
                    ? 'Request service'
                    : 'Provider unavailable'
                }
                disabled={
                  !provider.available
                }
                onPress={() =>
                  navigation.navigate(
                    'BookingRequest',
                    {
                      providerId:
                        provider.id,
                    },
                  )
                }
                fullWidth
              />
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.stat}>
      <AppText variant="title">
        {value}
      </AppText>
      <AppText
        variant="caption"
        muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  heroCard: {
    borderRadius: radius.xl,
  },
  profileRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
  },
  profileCopy: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    flex: 1,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing[5],
    gap: spacing[2],
  },
  stat: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[5],
  },
  sectionCard: {
    marginTop: spacing[4],
  },
  sectionText: {
    marginTop: spacing[2],
  },
  serviceList: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  serviceCopy: {
    flex: 1,
  },
  reviewList: {
    marginTop: spacing[4],
    gap: spacing[4],
  },
  review: {
    paddingBottom: spacing[3],
  },
  bookingCard: {
    marginTop: spacing[4],
    gap: spacing[4],
  },
  error: {
    gap: spacing[4],
  },
  skeletonGap: {
    marginTop: spacing[3],
  },
});
