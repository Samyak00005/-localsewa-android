import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { locationApi } from '../../api/locationApi';
import { AppIcon, iconSize } from '../../components/icons';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import {
  AlertBanner,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Input,
  Skeleton,
} from '../../components/ui';
import { useCustomerProfile } from '../../hooks/useAccount';
import {
  useCreateBooking,
  useProviderDetails,
} from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { VerifiedLocation } from '../../types/location';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookingRequest'>;

function requestId(): string {
  return `and_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function bookingDateValue(value: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function bookingTimeValue(value: string): string | null {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(value.trim());

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  const suffix = match[3].toLowerCase();

  if (hours === 12) {
    hours = 0;
  }

  if (suffix === 'pm') {
    hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function futureSchedule(date: string, time: string): boolean {
  const bookingDate = bookingDateValue(date);
  const bookingTime = bookingTimeValue(time);

  if (!bookingDate || !bookingTime) {
    return false;
  }

  const target = new Date(`${bookingDate}T${bookingTime}:00+05:30`);

  return Number.isFinite(target.getTime()) && target.getTime() > Date.now();
}

function money(value?: number): string | null {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function BookingRequestScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  const {
    data: provider,
    isLoading,
    error: providerError,
  } = useProviderDetails(route.params.providerId);

  const { data: profile } = useCustomerProfile();

  const createBooking = useCreateBooking();

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [customSelected, setCustomSelected] = useState(false);
  const [customService, setCustomService] = useState('');

  const [address, setAddress] = useState('');
  const [verifiedLocation, setVerifiedLocation] =
    useState<VerifiedLocation | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  const [serviceExpanded, setServiceExpanded] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [scheduleExpanded, setScheduleExpanded] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef<string | null>(null);
  const defaultLocationApplied = useRef(false);

  useEffect(() => {
    if (
      defaultLocationApplied.current ||
      address.trim() ||
      !profile?.location
    ) {
      return;
    }

    defaultLocationApplied.current = true;
    setAddress(profile.location);
  }, [address, profile?.location]);

  function payloadChanged() {
    requestIdRef.current = null;
  }

  function changeAddress(value: string) {
    setAddress(value);
    setVerifiedLocation(null);
    payloadChanged();
  }

  async function verifyAddress() {
    setError(null);

    if (address.trim().length < 5) {
      setError('Enter the complete service address first.');
      return;
    }

    setVerifying(true);

    try {
      const result = await locationApi.validateAddress(address);

      setAddress(result.address);
      setVerifiedLocation(result);
      payloadChanged();
    } catch (verificationError) {
      setVerifiedLocation(null);
      setError(errorMessage(verificationError));
    } finally {
      setVerifying(false);
    }
  }

  async function submit() {
    setError(null);

    if (!provider) {
      setError('Provider details are unavailable.');
      return;
    }

    const selectedService = provider.services.find(
      service => service.id === serviceId,
    );

    if (!customSelected && !selectedService) {
      setError('Choose a service first.');
      return;
    }

    if (customSelected && customService.trim().length < 3) {
      setError('Describe the custom service you need.');
      return;
    }

    if (!verifiedLocation) {
      setError('Verify the service address before sending the request.');
      return;
    }

    if (!futureSchedule(date, time)) {
      setError('Choose a valid future date and time using DD/MM/YYYY and AM/PM.');
      return;
    }

    const bookingDate = bookingDateValue(date);
    const bookingTime = bookingTimeValue(time);

    if (!bookingDate || !bookingTime) {
      setError('Choose a valid future date and time.');
      return;
    }

    const numericServiceId = selectedService
      ? Number(selectedService.id)
      : undefined;

    if (
      selectedService &&
      (!Number.isInteger(numericServiceId) || Number(numericServiceId) <= 0)
    ) {
      setError('This provider service cannot be booked right now.');
      return;
    }

    if (!requestIdRef.current) {
      requestIdRef.current = requestId();
    }

    try {
      const result = await createBooking.mutateAsync({
        providerId: provider.id,
        providerServiceId: customSelected ? undefined : numericServiceId,
        customServiceName: customSelected ? customService : undefined,
        bookingDate,
        bookingTime,
        note,
        location: verifiedLocation,
        requestId: requestIdRef.current,
      });

      if (result.bookingId) {
        requestIdRef.current = null;

        navigation.replace('BookingDetails', {
          bookingId: result.bookingId,
        });
        return;
      }

      requestIdRef.current = null;

      navigation.navigate('CustomerTabs', {
        screen: 'CustomerBookings',
      });
    } catch (submitError) {
      // Preserve request_id on an unchanged retry to avoid duplicate booking
      // creation when the network result is uncertain.
      setError(errorMessage(submitError));
    }
  }

  function navigateTab(
    tab:
      | 'CustomerHome'
      | 'CustomerServices'
      | 'CustomerBookings'
      | 'CustomerSaved'
      | 'CustomerProfile',
  ) {
    navigation.navigate('CustomerTabs', {
      screen: tab,
    });
  }

  const selectedServiceName = customSelected
    ? customService.trim() || 'Custom service'
    : provider?.services.find(item => item.id === serviceId)?.name || 'Not selected';

  const addressSummary =
    verifiedLocation?.areaLabel || address.trim() || 'Address not added';

  const scheduleSummary =
    date.trim() && time.trim() ? `${date.trim()} · ${time.trim()}` : 'Schedule not selected';

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <CustomerHeader routeName="CustomerServices" />

      {isLoading ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton width="52%" height={28} />
          <Skeleton width="100%" height={108} style={styles.topGap} />
          <Skeleton width="100%" height={220} style={styles.topGap} />
          <Skeleton width="100%" height={210} style={styles.topGap} />
        </ScrollView>
      ) : providerError || !provider ? (
        <View style={styles.errorScreen}>
          <AlertBanner variant="error">
            {errorMessage(
              providerError ?? new Error('Provider could not be loaded.'),
            )}
          </AlertBanner>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="h1">Request service</AppText>

          <AppText variant="body" muted style={styles.subtitle}>
            Confirm the service, address and preferred schedule before sending
            the request.
          </AppText>

          {error ? (
            <View style={styles.alertGap}>
              <AlertBanner variant="error">{error}</AlertBanner>
            </View>
          ) : null}

          <Card style={styles.providerCard}>
            <View style={styles.providerTitle}>
              {provider.imageUrl ? (
                <Image
                  source={{ uri: provider.imageUrl }}
                  style={styles.providerImage}
                />
              ) : (
                <Avatar initials={provider.name} size="lg" />
              )}

              <View style={styles.providerCopy}>
                <AppText variant="title" numberOfLines={2}>
                  {provider.name}
                </AppText>

                <AppText
                  variant="label"
                  color={theme.colors.primary}
                  style={styles.smallGap}
                >
                  {provider.category}
                </AppText>

                <View style={styles.locationRow}>
                  <AppIcon
                    name="mapPin"
                    size={14}
                    color={theme.colors.textMuted}
                  />

                  <AppText variant="caption" muted numberOfLines={1} style={styles.flex}>
                    {provider.location}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.providerStatusRow}>
              {provider.verified ? (
                <Badge variant="success">VERIFIED</Badge>
              ) : null}

              <Badge variant={provider.available ? 'success' : 'default'}>
                {provider.available ? 'AVAILABLE' : 'UNAVAILABLE'}
              </Badge>
            </View>
          </Card>

          <Card style={styles.stepCard}>
            <StepHeader
              number="1"
              title="Choose service"
              text="Pick a listed service or send a custom request."
              summary={selectedServiceName}
              expanded={serviceExpanded}
              onToggle={() => setServiceExpanded(value => !value)}
            />

            {serviceExpanded ? (
            <View style={styles.choices}>
              {provider.services.map(service => {
                const selected = !customSelected && service.id === serviceId;
                const servicePrice = money(service.price);

                return (
                  <Pressable
                    key={service.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setCustomSelected(false);
                      setServiceId(service.id);
                      payloadChanged();
                    }}
                    style={[
                      styles.choice,
                      {
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                        backgroundColor: selected
                          ? '#F0FBF5'
                          : theme.colors.surface,
                      },
                    ]}
                  >
                    <View style={styles.choiceIndicator}>
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: selected
                              ? theme.colors.primary
                              : theme.colors.disabled,
                          },
                        ]}
                      >
                        {selected ? (
                          <View
                            style={[
                              styles.radioDot,
                              {
                                backgroundColor: theme.colors.primary,
                              },
                            ]}
                          />
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.choiceCopy}>
                      <AppText variant="label">{service.name}</AppText>

                      {service.description ? (
                        <AppText variant="caption" muted style={styles.smallGap}>
                          {service.description}
                        </AppText>
                      ) : null}
                    </View>

                    {servicePrice ? (
                      <View
                        style={[
                          styles.pricePill,
                          {
                            backgroundColor: theme.colors.secondary,
                          },
                        ]}
                      >
                        <AppText variant="label" color={theme.colors.primary}>
                          {servicePrice}
                        </AppText>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: customSelected }}
                onPress={() => {
                  setCustomSelected(true);
                  setServiceId(null);
                  payloadChanged();
                }}
                style={[
                  styles.choice,
                  {
                    borderColor: customSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    backgroundColor: customSelected
                      ? '#F0FBF5'
                      : theme.colors.surface,
                  },
                ]}
              >
                <View style={styles.choiceIndicator}>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: customSelected
                          ? theme.colors.primary
                          : theme.colors.disabled,
                      },
                    ]}
                  >
                    {customSelected ? (
                      <View
                        style={[
                          styles.radioDot,
                          {
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    ) : null}
                  </View>
                </View>

                <View style={styles.choiceCopy}>
                  <AppText variant="label">Something else</AppText>
                  <AppText variant="caption" muted style={styles.smallGap}>
                    Describe a service that is not listed above.
                  </AppText>
                </View>
              </Pressable>

              {customSelected ? (
                <Input
                  label="Custom service"
                  placeholder="What do you need help with?"
                  value={customService}
                  onChangeText={value => {
                    setCustomService(value);
                    payloadChanged();
                  }}
                  multiline
                  maxLength={160}
                  style={styles.multiline}
                />
              ) : null}
            </View>
            ) : null}
          </Card>

          <Card style={styles.stepCard}>
            <StepHeader
              number="2"
              title="Service address"
              text="The address must be verified before the request is sent."
              summary={addressSummary}
              expanded={addressExpanded}
              onToggle={() => setAddressExpanded(value => !value)}
            />

            {addressExpanded ? (
            <View style={styles.sectionGap}>
              {profile?.location && !verifiedLocation ? (
                <View
                  style={[
                    styles.savedLocationHint,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <AppIcon
                    name="mapPin"
                    size={iconSize.xs}
                    color={theme.colors.primary}
                  />

                  <AppText variant="caption" muted style={styles.flex}>
                    Your saved default location is prefilled. Verify it for this
                    booking before continuing.
                  </AppText>
                </View>
              ) : null}

              <Input
                label="Exact service address"
                placeholder="House/road, area, city, Maharashtra, PIN code"
                value={address}
                onChangeText={changeAddress}
                multiline
                maxLength={240}
                style={styles.address}
              />

              <Button
                label={verifiedLocation ? 'Verify again' : 'Verify address'}
                icon="checkCircle"
                variant={verifiedLocation ? 'secondary' : 'outline'}
                loading={verifying}
                onPress={verifyAddress}
                fullWidth
              />

              {verifiedLocation ? (
                <View
                  style={[
                    styles.verifiedLocation,
                    {
                      backgroundColor: '#ECFAF1',
                      borderColor: '#C8EBD6',
                    },
                  ]}
                >
                  <AppIcon
                    name="checkCircle"
                    size={iconSize.sm}
                    color="#087443"
                  />

                  <View style={styles.flex}>
                    <AppText variant="label" color="#087443">
                      Address verified
                    </AppText>
                    <AppText variant="caption" color="#32664A" style={styles.smallGap}>
                      {verifiedLocation.areaLabel}
                    </AppText>
                  </View>
                </View>
              ) : null}
            </View>
            ) : null}
          </Card>

          <Card style={styles.stepCard}>
            <StepHeader
              number="3"
              title="Preferred schedule"
              text="Choose a future appointment using India time."
              summary={scheduleSummary}
              expanded={scheduleExpanded}
              onToggle={() => setScheduleExpanded(value => !value)}
            />

            {scheduleExpanded ? (
            <>
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleField}>
                <Input
                  label="Date"
                  placeholder="DD/MM/YYYY"
                  value={date}
                  onChangeText={value => {
                    setDate(value);
                    payloadChanged();
                  }}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>

              <View style={styles.scheduleField}>
                <Input
                  label="Time"
                  placeholder="3:45 PM"
                  value={time}
                  onChangeText={value => {
                    setTime(value);
                    payloadChanged();
                  }}
                  autoCapitalize="characters"
                  maxLength={8}
                />
              </View>
            </View>

            <Input
              label="Note (optional)"
              placeholder="Problem details, quantity, landmark or instructions"
              value={note}
              onChangeText={value => {
                setNote(value);
                payloadChanged();
              }}
              multiline
              maxLength={1000}
              style={styles.multiline}
            />
            </>
            ) : null}
          </Card>

          <Card style={styles.reviewCard}>
            <View style={styles.reviewTitleRow}>
              <View
                style={[
                  styles.reviewIcon,
                  {
                    backgroundColor: theme.colors.secondary,
                  },
                ]}
              >
                <AppIcon
                  name="checkCircle"
                  size={iconSize.sm}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.flex}>
                <AppText variant="title">Review request</AppText>
                <AppText variant="caption" muted style={styles.smallGap}>
                  Check the details before sending.
                </AppText>
              </View>
            </View>

            <View style={styles.summary}>
              <SummaryRow label="Provider" value={provider.name} />
              <Divider />
              <SummaryRow
                label="Service"
                value={
                  customSelected
                    ? customService || 'Custom service'
                    : provider.services.find(item => item.id === serviceId)
                        ?.name || 'Not selected'
                }
              />
              <Divider />
              <SummaryRow
                label="Address"
                value={verifiedLocation ? verifiedLocation.areaLabel : 'Not verified'}
              />
              <Divider />
              <SummaryRow
                label="Schedule"
                value={date && time ? `${date} · ${time}` : 'Not selected'}
              />
            </View>
          </Card>

          <View style={styles.submit}>
            <Button
              label="Send booking request"
              icon="calendar"
              loading={createBooking.isPending}
              disabled={!provider.available}
              onPress={submit}
              fullWidth
            />

            {!provider.available ? (
              <AppText variant="caption" muted style={styles.center}>
                This provider is currently unavailable for new requests.
              </AppText>
            ) : (
              <AppText variant="caption" muted style={styles.center}>
                In-app chat becomes available after the provider accepts your
                request.
              </AppText>
            )}
          </View>
        </ScrollView>
      )}

      <CustomerDetailBottomBar
        activeRoute="CustomerServices"
        onNavigate={navigateTab}
      />
    </View>
  );
}

function StepHeader({
  number,
  title,
  text,
  summary,
  expanded,
  onToggle,
}: {
  number: string;
  title: string;
  text: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.stepHeader,
        {
          opacity: pressed ? 0.76 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.stepNumber,
          {
            backgroundColor: theme.colors.secondary,
          },
        ]}
      >
        <AppText variant="label" color={theme.colors.primary}>
          {number}
        </AppText>
      </View>

      <View style={styles.stepCopy}>
        <AppText variant="title">{title}</AppText>

        <AppText
          variant="caption"
          muted
          style={styles.smallGap}
          numberOfLines={expanded ? 2 : 1}
        >
          {expanded ? text : summary}
        </AppText>
      </View>

      <View
        style={[
          styles.expandControl,
          {
            backgroundColor: theme.colors.surfaceMuted,
          },
        ]}
      >
        <AppIcon
          name={expanded ? 'chevronUp' : 'chevronDown'}
          size={iconSize.sm}
          color={theme.colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="caption" muted>
        {label}
      </AppText>

      <AppText variant="label" style={styles.summaryValue}>
        {value}
      </AppText>
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
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenHorizontal,
  },
  subtitle: {
    marginTop: spacing[2],
  },
  topGap: {
    marginTop: spacing[4],
  },
  alertGap: {
    marginTop: spacing[4],
  },
  providerCard: {
    marginTop: spacing[5],
    borderRadius: 22,
  },
  providerTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  providerImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
  },
  providerStatusRow: {
    marginTop: spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  locationRow: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  stepCard: {
    marginTop: spacing[4],
    borderRadius: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCopy: {
    flex: 1,
    minWidth: 0,
  },
  expandControl: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choices: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  choice: {
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  choiceIndicator: {
    paddingTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  choiceCopy: {
    flex: 1,
    minWidth: 0,
  },
  pricePill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexShrink: 0,
  },
  sectionGap: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  savedLocationHint: {
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  address: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  verifiedLocation: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  scheduleRow: {
    marginTop: spacing[4],
    flexDirection: 'row',
    gap: spacing[3],
  },
  scheduleField: {
    flex: 1,
    minWidth: 0,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    marginTop: spacing[3],
  },
  reviewCard: {
    marginTop: spacing[4],
    borderRadius: 20,
  },
  reviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  reviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  summaryRow: {
    paddingVertical: spacing[1],
  },
  summaryValue: {
    marginTop: spacing[1],
  },
  submit: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  center: {
    textAlign: 'center',
  },
});
