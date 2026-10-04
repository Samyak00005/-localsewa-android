import React, {
  useState,
} from 'react';
import {
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
  SettingsRow,
} from '../../components/account';
import {
  AlertBanner,
  AppText,
  Badge,
  Button,
  Card,
} from '../../components/ui';
import {useAuth} from '../../auth';
import {
  useCustomerProfile,
} from '../../hooks/useAccount';
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
    'AccountSecurity'
  >;

export function AccountSecurityScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    logoutAll,
  } = useAuth();

  const {
    data: profile,
  } = useCustomerProfile();

  const [busy, setBusy] =
    useState(false);

  const [screenError, setScreenError] =
    useState<string | null>(
      null,
    );

  async function signOutEverywhere() {
    setBusy(true);
    setScreenError(null);

    try {
      await logoutAll();
    } catch (
      mutationError
    ) {
      setScreenError(
        errorMessage(
          mutationError,
        ),
      );
      setBusy(false);
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
      }>
      <AppText variant="h1">
        Account security
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Verified security actions for your Localsewa account.
      </AppText>

      {screenError ? (
        <View style={styles.section}>
          <AlertBanner variant="error">
            {screenError}
          </AlertBanner>
        </View>
      ) : null}

      <Card style={styles.summaryCard}>
        <AppText variant="label">
          Account email
        </AppText>

        <AppText
          variant="bodySmall"
          muted
          style={styles.subtitle}>
          {profile?.email ??
            'No email available'}
        </AppText>

        <View style={styles.badges}>
          <Badge
            variant={
              profile?.emailVerified
                ? 'success'
                : 'warning'
            }>
            {profile?.emailVerified
              ? 'EMAIL VERIFIED'
              : 'EMAIL NOT VERIFIED'}
          </Badge>

          {profile?.googleLinked ? (
            <Badge>
              GOOGLE LINKED
            </Badge>
          ) : null}
        </View>
      </Card>

      <View style={styles.section}>
        <AppText variant="title">
          Password & email
        </AppText>

        <View style={styles.rows}>
          <SettingsRow
            icon="key"
            title="Change password"
            subtitle="Current password → email OTP → new password"
            onPress={() =>
              navigation.navigate(
                'ChangePassword',
              )
            }
          />

          {profile?.googleLinked ? (
            <SettingsRow
              icon="lock"
              title="Set a password"
              subtitle="For Google-first accounts that do not yet have a user-chosen password"
              onPress={() =>
                navigation.navigate(
                  'SetPassword',
                )
              }
            />
          ) : null}

          <SettingsRow
            icon="mail"
            title="Change account email"
            subtitle="Verify the new email before replacing the current one"
            onPress={() =>
              navigation.navigate(
                'ChangeEmail',
              )
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title">
          Sessions
        </AppText>

        <Button
          label="Sign out all devices"
          icon="lock"
          variant="destructive"
          loading={busy}
          onPress={
            signOutEverywhere
          }
          fullWidth
        />

        <AppText
          variant="caption"
          muted>
          This revokes all active Localsewa API sessions, including this device.
        </AppText>
      </View>
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
  summaryCard: {
    marginTop:
      spacing[6],
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop:
      spacing[3],
  },
  section: {
    marginTop:
      spacing[6],
    gap: spacing[3],
  },
  rows: {
    gap: spacing[2],
  },
});
