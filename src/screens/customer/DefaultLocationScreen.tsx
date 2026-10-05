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
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      style={
        styles.overlay
      }>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close default location popup"
        style={
          StyleSheet.absoluteFillObject
        }
        onPress={close}
      />

      <View
        style={[
          styles.sheet,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
          shadows.md,
        ]}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor:
                theme.colors.border,
            },
          ]}>
          <View
            style={
              styles.headerCopy
            }>
            <AppText variant="h2">
              Default location
            </AppText>

            <AppText
              variant="caption"
              muted
              style={
                styles.subtitle
              }>
              Verify your usual service address for faster bookings.
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
                backgroundColor:
                  theme.colors.surfaceMuted,
                opacity:
                  busy
                    ? 0.45
                    : pressed
                      ? 0.72
                      : 1,
              },
            ]}>
            <AppIcon
              name="x"
              size={
                iconSize.sm
              }
              color={
                theme.colors.textMuted
              }
            />
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.content
          }>
          {screenError ? (
            <AlertBanner variant="error">
              {screenError}
            </AlertBanner>
          ) : null}

          <Input
            label="Address"
            placeholder="House/road, area, city, state, PIN"
            value={address}
            onChangeText={value => {
              setAddress(value);
              setVerified(null);
              setScreenError(null);
            }}
            multiline
            editable={!busy}
            maxLength={240}
            style={
              styles.address
            }
          />

          <Button
            label={
              verified
                ? 'Verify again'
                : 'Verify address'
            }
            variant="outline"
            loading={verifying}
            disabled={
              update.isPending
            }
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
            disabled={
              !verified ||
              verifying
            }
            loading={
              update.isPending
            }
            onPress={save}
            fullWidth
          />

          <View
            style={[
              styles.integrity,
              {
                backgroundColor:
                  theme.colors.surfaceMuted,
              },
            ]}>
            <AppIcon
              name="shieldCheck"
              size={
                iconSize.sm
              }
              color={
                theme.colors.primary
              }
            />

            <AppText
              variant="caption"
              muted
              style={
                styles.integrityText
              }>
              Localsewa saves the verified address and matching coordinates,
              not a guessed map point.
            </AppText>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor:
        'rgba(7,24,17,0.46)',
      justifyContent:
        'center',
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[6],
    },
    sheet: {
      width: '100%',
      maxWidth: 430,
      maxHeight: '82%',
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: 24,
      overflow: 'hidden',
    },
    header: {
      minHeight: 82,
      paddingHorizontal:
        spacing[4],
      paddingVertical:
        spacing[3],
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
    },
    subtitle: {
      marginTop:
        spacing[1],
    },
    close: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    content: {
      padding:
        spacing[4],
      paddingBottom:
        spacing[6],
      gap: spacing[4],
    },
    address: {
      minHeight: 96,
      textAlignVertical:
        'top',
    },
    integrity: {
      borderRadius:
        radius.md,
      padding:
        spacing[3],
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: spacing[2],
    },
    integrityText: {
      flex: 1,
      lineHeight: 18,
    },
  });
