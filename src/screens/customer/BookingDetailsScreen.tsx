import React, {
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Linking,
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
  BookingStatusBadge,
} from '../../components/customer';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Divider,
  Skeleton,
} from '../../components/ui';
import {
  useCancelBooking,
  useCustomerBookings,
} from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'BookingDetails'
  >;

function money(
  value: number | null,
): string | null {
  if (value == null) {
    return null;
  }

  return `₹${Math.round(
    value,
  ).toLocaleString('en-IN')}`;
}

export function BookingDetailsScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const [
    actionError,
    setActionError,
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
  } = useCustomerBookings();

  const cancel =
    useCancelBooking();

  const booking =
    useMemo(
      () =>
        data.find(
          item =>
            item.id ===
            route.params.bookingId,
        ),
      [
        data,
        route.params.bookingId,
      ],
    );

  function confirmCancel() {
    if (!booking) {
      return;
    }

    Alert.alert(
      'Cancel booking?',
      'This request will be cancelled. The provider will be notified.',
      [
        {
          text: 'Keep booking',
          style: 'cancel',
        },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            setActionError(null);

            try {
              await cancel.mutateAsync(
                booking.id,
              );
            } catch (
              mutationError
            ) {
              setActionError(
                errorMessage(
                  mutationError,
                ),
              );
            }
          },
        },
      ],
    );
  }

  async function openMap(
    url: string | null,
  ) {
    if (!url) {
      return;
    }

    try {
      await Linking.openURL(
        url,
      );
    } catch {
      setActionError(
        'Unable to open Maps on this device.',
      );
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
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}>
        <AppText variant="h1">
          Booking details
        </AppText>

        <AppText
          variant="body"
          muted
          style={
            styles.pageSubtitle
          }>
          Track the request and use only the actions currently allowed by the
          backend.
        </AppText>

        {isLoading ? (
          <Card
            style={
              styles.firstCard
            }>
            <Skeleton
              width="65%"
              height={26}
            />
            <Skeleton
              width="90%"
              height={16}
              style={styles.gap}
            />
            <Skeleton
              width="100%"
              height={120}
              style={styles.gap}
            />
          </Card>
        ) : error || !booking ? (
          <View
            style={
              styles.actions
            }>
            <AlertBanner variant="error">
              {errorMessage(
                error ??
                  new Error(
                    'Booking could not be loaded.',
                  ),
              )}
            </AlertBanner>

            <Button
              label="Retry"
              loading={
                isRefetching
              }
              onPress={() => {
                refetch();
              }}
              fullWidth
            />
          </View>
        ) : (
          <>
            {actionError ? (
              <View
                style={
                  styles.firstCard
                }>
                <AlertBanner variant="error">
                  {actionError}
                </AlertBanner>
              </View>
            ) : null}

            <Card
              style={
                styles.heroCard
              }>
              <View
                style={
                  styles.titleRow
                }>
                <View
                  style={
                    styles.titleCopy
                  }>
                  <AppText variant="h2">
                    {booking.serviceName}
                  </AppText>

                  <AppText
                    variant="bodySmall"
                    muted
                    style={
                      styles.smallGap
                    }>
                    {booking.providerName}
                  </AppText>
                </View>

                <BookingStatusBadge
                  status={
                    booking.status
                  }
                />
              </View>

              <View
                style={
                  styles.codeRow
                }>
                <AppText
                  variant="caption"
                  muted>
                  Booking ID
                </AppText>

                <AppText variant="label">
                  {booking.bookingCode}
                </AppText>
              </View>
            </Card>

            {booking.chatEnabled ? (
              <Card
                style={
                  styles.chatCard
                }>
                <View
                  style={
                    styles.chatCopy
                  }>
                  <AppText variant="title">
                    Contact provider
                  </AppText>

                  <AppText
                    variant="bodySmall"
                    muted
                    style={
                      styles.smallGap
                    }>
                    Chat is live. Voice calling is UI-only for now.
                  </AppText>
                </View>

                <View
                  style={
                    styles.communicationRow
                  }>
                  <View
                    style={
                      styles.communicationAction
                    }>
                    <Button
                      label="Open chat"
                      icon="message"
                      onPress={() =>
                        navigation.navigate(
                          'BookingChat',
                          {
                            bookingId:
                              booking.id,
                          },
                        )
                      }
                      fullWidth
                    />
                  </View>

                  <View
                    style={
                      styles.communicationAction
                    }>
                    <Button
                      label="Call"
                      icon="phone"
                      variant="outline"
                      onPress={() =>
                        navigation.navigate(
                          'VoiceCallPreview',
                          {
                            bookingId:
                              booking.id,
                          },
                        )
                      }
                      fullWidth
                    />
                  </View>
                </View>
              </Card>
            ) : null}

            <Card
              style={
                styles.sectionCard
              }>
              <AppText variant="title">
                Schedule
              </AppText>

              <InfoRow
                label="Date"
                value={
                  booking.date
                }
              />

              <Divider />

              <InfoRow
                label="Time"
                value={
                  booking.time
                    ? booking.time.slice(
                        0,
                        5,
                      )
                    : '—'
                }
              />

              {booking.distanceLabel ? (
                <>
                  <Divider />
                  <InfoRow
                    label="Distance"
                    value={
                      booking.distanceLabel
                    }
                  />
                </>
              ) : null}
            </Card>

            <Card
              style={
                styles.sectionCard
              }>
              <AppText variant="title">
                Service location
              </AppText>

              <AppText
                variant="bodySmall"
                muted
                style={
                  styles.sectionText
                }>
                {booking.location ||
                  booking.area ||
                  'Location is hidden for this booking state.'}
              </AppText>

              {booking.mapsUrl ? (
                <Button
                  label="Open service location"
                  icon="mapPin"
                  variant="outline"
                  onPress={() => {
                    openMap(
                      booking.mapsUrl,
                    );
                  }}
                  fullWidth
                />
              ) : null}
            </Card>

            {booking.providerLocation ? (
              <Card
                style={
                  styles.sectionCard
                }>
                <AppText variant="title">
                  Provider location
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  style={
                    styles.sectionText
                  }>
                  {booking.providerLocation}
                </AppText>

                {booking.providerMapsUrl ? (
                  <Button
                    label="Open provider location"
                    icon="mapPin"
                    variant="outline"
                    onPress={() => {
                      openMap(
                        booking.providerMapsUrl,
                      );
                    }}
                    fullWidth
                  />
                ) : null}
              </Card>
            ) : null}

            <Card
              style={
                styles.sectionCard
              }>
              <AppText variant="title">
                Booking details
              </AppText>

              {money(
                booking.servicePrice,
              ) ? (
                <InfoRow
                  label="Service price"
                  value={
                    money(
                      booking.servicePrice,
                    ) ?? '—'
                  }
                />
              ) : null}

              {booking.note ? (
                <>
                  <Divider />
                  <View
                    style={
                      styles.note
                    }>
                    <AppText
                      variant="caption"
                      muted>
                      Your note
                    </AppText>

                    <AppText
                      variant="bodySmall"
                      style={
                        styles.smallGap
                      }>
                      {booking.note}
                    </AppText>
                  </View>
                </>
              ) : null}

              {booking.reason ? (
                <>
                  <Divider />
                  <View
                    style={
                      styles.note
                    }>
                    <AppText
                      variant="caption"
                      muted>
                      Reason
                    </AppText>

                    <AppText
                      variant="bodySmall"
                      style={
                        styles.smallGap
                      }>
                      {booking.reason}
                    </AppText>
                  </View>
                </>
              ) : null}
            </Card>

            <View
              style={
                styles.actions
              }>
              {booking.canRate ? (
                <Button
                  label="Rate this service"
                  icon="star"
                  onPress={() =>
                    navigation.navigate(
                      'BookingReview',
                      {
                        bookingId:
                          booking.id,
                      },
                    )
                  }
                  fullWidth
                />
              ) : null}

              {booking.canRebook &&
              booking.providerId ? (
                <Button
                  label="View provider to rebook"
                  icon="user"
                  variant="outline"
                  onPress={() =>
                    navigation.navigate(
                      'ProviderDetails',
                      {
                        providerId:
                          booking.providerId,
                      },
                    )
                  }
                  fullWidth
                />
              ) : null}

              {booking.canCancel ? (
                <Button
                  label="Cancel booking"
                  icon="trash"
                  variant="destructive"
                  loading={
                    cancel.isPending
                  }
                  onPress={
                    confirmCancel
                  }
                  fullWidth
                />
              ) : null}
            </View>

            <AppText
              variant="caption"
              muted
              style={
                styles.paymentNote
              }>
              “Service price” is the backend booking price. A completed booking
              is not treated as proof of online payment.
            </AppText>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View
      style={styles.infoRow}>
      <AppText
        variant="caption"
        muted>
        {label}
      </AppText>

      <AppText
        variant="label"
        style={
          styles.infoValue
        }>
        {value}
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
    paddingBottom:
      spacing[12],
  },
  pageSubtitle: {
    marginTop: spacing[2],
  },
  firstCard: {
    marginTop: spacing[5],
  },
  heroCard: {
    marginTop: spacing[5],
  },
  chatCard: {
    marginTop: spacing[4],
    gap: spacing[4],
  },
  chatCopy: {
    flex: 1,
  },
  communicationRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  communicationAction: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  titleCopy: {
    flex: 1,
  },
  codeRow: {
    marginTop: spacing[5],
    gap: spacing[1],
  },
  sectionCard: {
    marginTop: spacing[4],
    gap: spacing[4],
  },
  sectionText: {
    marginTop: spacing[2],
  },
  infoRow: {
    paddingVertical:
      spacing[1],
  },
  infoValue: {
    marginTop: spacing[1],
  },
  note: {
    paddingVertical:
      spacing[1],
  },
  smallGap: {
    marginTop: spacing[1],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  paymentNote: {
    textAlign: 'center',
    marginTop: spacing[5],
  },
  gap: {
    marginTop: spacing[3],
  },
});
