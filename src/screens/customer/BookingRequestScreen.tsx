import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { locationApi } from '../../api/locationApi';
import {
  AlertBanner,
  AppText,
  Badge,
  Button,
  Card,
  Divider,
  Input,
  Skeleton,
} from '../../components/ui';
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

function futureSchedule(date: string, time: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    return false;
  }

  const target = new Date(`${date}T${time}:00+05:30`);

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

  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef<string | null>(null);

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
      setError('Choose a service.');
      return;
    }

    if (customSelected && customService.trim().length < 3) {
      setError('Describe the custom service you need.');
      return;
    }

    if (!verifiedLocation) {
      setError('Verify the service address before booking.');
      return;
    }

    if (!futureSchedule(date, time)) {
      setError(
        'Enter a valid future date and time. Date format: YYYY-MM-DD, time format: HH:mm.',
      );
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
        bookingDate: date,
        bookingTime: time,
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
      // Deliberately preserve requestIdRef here.
      // Retrying the unchanged form reuses the same request_id.
      setError(errorMessage(submitError));
    }
  }

  if (isLoading) {
    return (
      <ScrollView
        style={{
          backgroundColor: theme.colors.background,
        }}
        contentContainerStyle={styles.content}
      >
        <Skeleton width="60%" height={28} />
        <Skeleton width="100%" height={130} style={styles.topGap} />
        <Skeleton width="100%" height={220} style={styles.topGap} />
      </ScrollView>
    );
  }

  if (providerError || !provider) {
    return (
      <View
        style={[
          styles.errorScreen,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <AlertBanner variant="error">
          {errorMessage(
            providerError ?? new Error('Provider could not be loaded.'),
          )}
        </AlertBanner>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="h1">Request service</AppText>

      <AppText variant="body" muted style={styles.subtitle}>
        Send a real booking request to {provider.name}.
      </AppText>

      {error ? (
        <View style={styles.topGap}>
          <AlertBanner variant="error">{error}</AlertBanner>
        </View>
      ) : null}

      <Card style={styles.providerCard}>
        <View style={styles.providerTitle}>
          <View style={styles.providerCopy}>
            <AppText variant="title">{provider.name}</AppText>

            <AppText variant="bodySmall" color={theme.colors.primary}>
              {provider.category}
            </AppText>
          </View>

          <Badge variant={provider.available ? 'success' : 'default'}>
            {provider.available ? 'AVAILABLE' : 'UNAVAILABLE'}
          </Badge>
        </View>

        <AppText variant="caption" muted style={styles.smallGap}>
          {provider.location}
        </AppText>
      </Card>

      <Card style={styles.stepCard}>
        <StepHeader
          number="1"
          title="Choose service"
          text="Select one of this provider’s published services, or describe a custom request."
        />

        <View style={styles.choices}>
          {provider.services.map(service => {
            const selected = !customSelected && service.id === serviceId;

            return (
              <Pressable
                key={service.id}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                }}
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
                      ? theme.colors.secondary
                      : theme.colors.surface,
                  },
                ]}
              >
                <View style={styles.choiceCopy}>
                  <AppText variant="label">{service.name}</AppText>

                  {service.description ? (
                    <AppText variant="caption" muted style={styles.smallGap}>
                      {service.description}
                    </AppText>
                  ) : null}
                </View>

                {money(service.price) ? (
                  <AppText variant="label" color={theme.colors.primary}>
                    {money(service.price)}
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              selected: customSelected,
            }}
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
                  ? theme.colors.secondary
                  : theme.colors.surface,
              },
            ]}
          >
            <View style={styles.choiceCopy}>
              <AppText variant="label">Something else</AppText>
              <AppText variant="caption" muted style={styles.smallGap}>
                Request a service not listed in the provider catalog.
              </AppText>
            </View>
          </Pressable>

          {customSelected ? (
            <Input
              label="Custom service"
              placeholder="Describe what you need"
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
      </Card>

      <Card style={styles.stepCard}>
        <StepHeader
          number="2"
          title="Verify service address"
          text="Localsewa verifies the address before it is attached to the booking."
        />

        <View style={styles.sectionGap}>
          <Input
            label="Exact address"
            placeholder="House/road, area, city, Maharashtra, PIN code"
            value={address}
            onChangeText={changeAddress}
            multiline
            maxLength={240}
            style={styles.address}
          />

          <Button
            label={verifiedLocation ? 'Verify again' : 'Verify address'}
            variant={verifiedLocation ? 'secondary' : 'outline'}
            loading={verifying}
            onPress={verifyAddress}
            fullWidth
          />

          {verifiedLocation ? (
            <AlertBanner variant="success">
              Verified: {verifiedLocation.areaLabel}
            </AlertBanner>
          ) : null}

          {verifiedLocation ? (
            <AppText variant="caption" muted>
              Coordinates are attached from the server verification proof; they
              are not guessed by the app.
            </AppText>
          ) : null}
        </View>
      </Card>

      <Card style={styles.stepCard}>
        <StepHeader
          number="3"
          title="Schedule"
          text="Choose a future appointment using India time."
        />

        <View style={styles.sectionGap}>
          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={value => {
              setDate(value);
              payloadChanged();
            }}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Input
            label="Time"
            placeholder="HH:mm"
            value={time}
            onChangeText={value => {
              setTime(value);
              payloadChanged();
            }}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <Input
            label="Additional details (optional)"
            placeholder="Problem, quantity, landmark or instructions"
            value={note}
            onChangeText={value => {
              setNote(value);
              payloadChanged();
            }}
            multiline
            maxLength={1000}
            style={styles.multiline}
          />
        </View>
      </Card>

      <Card style={styles.stepCard}>
        <AppText variant="title">Before you send</AppText>

        <View style={styles.summary}>
          <SummaryRow label="Provider" value={provider.name} />

          <Divider />

          <SummaryRow
            label="Service"
            value={
              customSelected
                ? customService || 'Custom service'
                : provider.services.find(item => item.id === serviceId)?.name ||
                  'Not selected'
            }
          />

          <Divider />

          <SummaryRow
            label="Location"
            value={
              verifiedLocation ? verifiedLocation.areaLabel : 'Not verified'
            }
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
          loading={createBooking.isPending}
          disabled={!provider.available}
          onPress={submit}
          fullWidth
        />

        {!provider.available ? (
          <AppText variant="caption" muted style={styles.center}>
            This provider is currently unavailable for new requests.
          </AppText>
        ) : null}

        <AppText variant="caption" muted style={styles.center}>
          If a network timeout happens, retrying this unchanged form reuses the
          same booking request ID.
        </AppText>
      </View>
    </ScrollView>
  );
}

function StepHeader({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.stepHeader}>
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

        <AppText variant="caption" muted style={styles.smallGap}>
          {text}
        </AppText>
      </View>
    </View>
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
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
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
    marginTop: spacing[5],
  },
  providerCard: {
    marginTop: spacing[6],
    borderRadius: radius.xl,
  },
  providerTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  providerCopy: {
    flex: 1,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  stepCard: {
    marginTop: spacing[4],
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCopy: {
    flex: 1,
  },
  choices: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  choice: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  choiceCopy: {
    flex: 1,
  },
  sectionGap: {
    gap: spacing[4],
    marginTop: spacing[5],
  },
  address: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
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
