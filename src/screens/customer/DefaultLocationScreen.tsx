import React, {
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  locationApi,
} from '../../api/locationApi';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Input,
} from '../../components/ui';
import {
  useCustomerProfile,
  useUpdateDefaultLocation,
} from '../../hooks/useAccount';
import {
  VerifiedLocation,
} from '../../types/location';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

export function DefaultLocationScreen(): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    data: profile,
  } = useCustomerProfile();

  const update =
    useUpdateDefaultLocation();

  const [address, setAddress] =
    useState(
      profile?.location ??
        '',
    );

  const [
    verified,
    setVerified,
  ] =
    useState<VerifiedLocation | null>(
      null,
    );

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [screenError, setScreenError] =
    useState<string | null>(
      null,
    );

  async function verify() {
    setMessage(null);
    setScreenError(null);
    setVerifying(true);

    try {
      const result =
        await locationApi.validateAddress(
          address,
        );

      setAddress(
        result.address,
      );
      setVerified(
        result,
      );
    } catch (
      verificationError
    ) {
      setVerified(null);
      setScreenError(
        errorMessage(
          verificationError,
        ),
      );
    } finally {
      setVerifying(false);
    }
  }

  async function save() {
    if (!verified) {
      setScreenError(
        'Verify the address first.',
      );
      return;
    }

    setScreenError(null);
    setMessage(null);

    try {
      await update.mutateAsync(
        verified,
      );

      setMessage(
        'Default location saved.',
      );
    } catch (
      mutationError
    ) {
      setScreenError(
        errorMessage(
          mutationError,
        ),
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
      keyboardShouldPersistTaps="handled">
      <AppText variant="h1">
        Default location
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Save a verified service address for faster future bookings.
      </AppText>

      {message ? (
        <View style={styles.section}>
          <AlertBanner variant="success">
            {message}
          </AlertBanner>
        </View>
      ) : null}

      {screenError ? (
        <View style={styles.section}>
          <AlertBanner variant="error">
            {screenError}
          </AlertBanner>
        </View>
      ) : null}

      <Card style={styles.card}>
        <View style={styles.form}>
          <Input
            label="Address"
            placeholder="House/road, area, city, state, PIN"
            value={address}
            onChangeText={value => {
              setAddress(value);
              setVerified(null);
              setMessage(null);
            }}
            multiline
            maxLength={240}
            style={styles.address}
          />

          <Button
            label={
              verified
                ? 'Verify again'
                : 'Verify address'
            }
            variant="outline"
            loading={verifying}
            onPress={verify}
            fullWidth
          />

          {verified ? (
            <AlertBanner variant="success">
              Verified: {verified.areaLabel}
            </AlertBanner>
          ) : null}

          <Button
            label="Save default location"
            disabled={!verified}
            loading={
              update.isPending
            }
            onPress={save}
            fullWidth
          />
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <AppText variant="label">
          Location integrity
        </AppText>

        <AppText
          variant="bodySmall"
          muted
          style={styles.subtitle}>
          Coordinates are saved from Localsewa's verification proof rather than
          being guessed from the text you entered.
        </AppText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom:
      spacing[12],
  },
  subtitle: {
    marginTop:
      spacing[2],
  },
  section: {
    marginTop:
      spacing[4],
  },
  card: {
    marginTop:
      spacing[6],
  },
  form: {
    gap: spacing[4],
  },
  address: {
    minHeight: 96,
    textAlignVertical:
      'top',
  },
  infoCard: {
    marginTop:
      spacing[4],
  },
});
