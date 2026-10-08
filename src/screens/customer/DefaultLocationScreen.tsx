import React, {
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  locationApi,
} from '../../api/locationApi';
import {
  AppIcon,
  iconSize,
} from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Button,
  Input,
} from '../../components/ui';
import {
  useCustomerProfile,
  useUpdateDefaultLocation,
} from '../../hooks/useAccount';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  layout,
  radius,
  shadows,
  spacing,
  useAppTheme,
} from '../../theme';
import {
  VerifiedLocation,
} from '../../types/location';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'DefaultLocation'
  >;

export function DefaultLocationScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const insets = useSafeAreaInsets();

  const {
    data: profile,
  } = useCustomerProfile();

  const update =
    useUpdateDefaultLocation();

  const [
    address,
    setAddress,
  ] =
    useState(
      profile?.location ?? '',
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
  ] =
    useState(false);

  const [
    screenError,
    setScreenError,
  ] =
    useState<string | null>(
      null,
    );

  const busy =
    verifying ||
    update.isPending;

  function close() {
    if (!busy) {
      navigation.goBack();
    }
  }

  async function verify() {
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

    try {
      await update.mutateAsync(
        verified,
      );
      navigation.goBack();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close location popup"
        style={StyleSheet.absoluteFillObject}
        onPress={close}
      />

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            marginBottom: Math.max(insets.bottom, layout.bottomSheetMargin),
          },
          shadows.md,
        ]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.headerCopy}>
            <AppText variant="overline" color={theme.colors.primary}>
              SERVICE AREA
            </AppText>

            <AppText variant="h2" style={styles.title}>
              Set your location
            </AppText>

            <AppText variant="caption" muted style={styles.subtitle}>
              Only verified Indian cities, areas and 6-digit PIN codes can be saved.
            </AppText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            disabled={busy}
            onPress={close}
            style={({pressed}) => [
              styles.close,
              {
                backgroundColor: theme.colors.surfaceMuted,
                opacity: busy ? 0.45 : pressed ? 0.72 : 1,
              },
            ]}
          >
            <AppIcon name="x" size={iconSize.sm} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {screenError ? (
            <AlertBanner variant="error">{screenError}</AlertBanner>
          ) : null}

          <View
            style={[
              styles.currentLocation,
              {
                backgroundColor: '#F2FFF7',
                borderColor: '#99DEB7',
              },
            ]}
          >
            <View style={styles.currentLocationIcon}>
              <AppIcon name="mapPin" size={iconSize.sm} color={theme.colors.primary} />
            </View>

            <View style={styles.currentLocationCopy}>
              <AppText variant="label" color={theme.colors.primary}>
                Use current location
              </AppText>

              <AppText variant="caption" muted style={styles.smallGap}>
                GPS se area, city, state aur PIN code pata kare
              </AppText>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.colors.border,
                },
              ]}
            />

            <AppText variant="overline" muted>
              OR ENTER MANUALLY
            </AppText>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.colors.border,
                },
              ]}
            />
          </View>

          <Input
            label="City, area or PIN code"
            placeholder="Example: Chandrapur or 442401"
            value={address}
            onChangeText={value => {
              setAddress(value);
              setVerified(null);
              setScreenError(null);
            }}
            editable={!busy}
            maxLength={240}
            leftAccessory={
              <AppIcon name="search" size={iconSize.xs} color={theme.colors.textMuted} />
            }
            helperText="Type a city, area or PIN code, then verify the location."
          />

          <Button
            label={verified ? 'Verify again' : 'Verify location'}
            variant="outline"
            loading={verifying}
            disabled={update.isPending}
            onPress={verify}
            fullWidth
          />

          {verified ? (
            <AlertBanner variant="success">
              Verified: {verified.areaLabel}
            </AlertBanner>
          ) : null}

          <Button
            label="Save location"
            disabled={!verified || verifying}
            loading={update.isPending}
            onPress={save}
            fullWidth
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,24,17,0.42)',
    justifyContent: 'flex-end',
    paddingHorizontal: layout.bottomSheetMargin,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '86%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    minHeight: 112,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    marginTop: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
    lineHeight: 18,
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  currentLocation: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  currentLocationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationCopy: {
    flex: 1,
    minWidth: 0,
  },
  smallGap: {
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
