import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAuth } from '../../auth';
import { AccordionCard, SecurityOtpStatus } from '../../components/account';
import { PasswordInput } from '../../components/auth';
import {
  AlertBanner,
  AppText,
  Badge,
  Button,
  Card,
  Input,
} from '../../components/ui';
import {
  useAccountDeletionStatus,
  useCustomerProfile,
} from '../../hooks/useAccount';
import {
  useRequestDeletionOtp,
  useScheduleAccountDeletion,
} from '../../hooks/useAccountSecurity';
import { layout, spacing, useAppTheme } from '../../theme';
import { validateOtp } from '../../utils/authValidation';

type ConfirmationMode = 'password' | 'otp';

export function AccountDeletionScreen(): React.JSX.Element {
  const { theme } = useAppTheme();

  const { clearLocalSession } = useAuth();

  const { data: profile } = useCustomerProfile();

  const { data, isLoading, error } = useAccountDeletionStatus();

  const requestOtp = useRequestDeletionOtp();

  const schedule = useScheduleAccountDeletion();

  const [mode, setMode] = useState<ConfirmationMode>('password');

  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState('');

  const [otpSent, setOtpSent] = useState(false);

  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const [resendIn, setResendIn] = useState(0);

  const [confirmPhrase, setConfirmPhrase] = useState('');

  const [screenError, setScreenError] = useState<string | null>(null);

  const onTick = useCallback((value: number) => setResendIn(value), []);

  const pending = data?.state === 'pending';

  async function sendOtp() {
    setScreenError(null);

    if (!profile?.emailVerified || !profile.email) {
      setScreenError('A verified account email is required for deletion OTP.');
      return;
    }

    try {
      const result = await requestOtp.mutateAsync();

      setMaskedEmail(result.maskedEmail);
      setResendIn(result.resendAfter || 60);
      setOtpSent(true);
    } catch (mutationError) {
      setScreenError(errorMessage(mutationError));
    }
  }

  async function scheduleDeletion() {
    setScreenError(null);

    if (confirmPhrase.trim() !== 'DELETE') {
      setScreenError('Type DELETE exactly to confirm.');
      return;
    }

    if (mode === 'password' && !password) {
      setScreenError('Enter your account password.');
      return;
    }

    if (mode === 'otp') {
      const otpCheck = validateOtp(otp);

      if (!otpCheck.valid) {
        setScreenError(otpCheck.message);
        return;
      }
    }

    try {
      await schedule.mutateAsync(
        mode === 'password'
          ? {
              method: 'password',
              password,
            }
          : {
              method: 'otp',
              otp,
            },
      );

      // Backend revokes all sessions immediately.
      await clearLocalSession();
    } catch (mutationError) {
      setScreenError(errorMessage(mutationError));
    }
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
      <AppText variant="h1" color={theme.colors.error}>
        Delete account
      </AppText>

      <AppText variant="body" muted style={styles.subtitle}>
        Deletion is scheduled for 30 days later. Scheduling signs this account
        out everywhere.
      </AppText>

      {isLoading ? (
        <Card style={styles.card}>
          <AppText variant="bodySmall">Loading deletion status…</AppText>
        </Card>
      ) : error ? (
        <View style={styles.card}>
          <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
        </View>
      ) : data ? (
        <Card style={styles.card}>
          <View style={styles.statusRow}>
            <AppText variant="title">Deletion status</AppText>

            <Badge
              variant={
                data.state === 'pending'
                  ? 'warning'
                  : data.state === 'completed'
                  ? 'error'
                  : 'default'
              }
            >
              {data.state.toUpperCase()}
            </Badge>
          </View>

          {pending ? (
            <>
              <AppText variant="bodySmall" muted style={styles.gap}>
                Scheduled for: {data.scheduledFor ?? '—'}
              </AppText>

              <AppText variant="bodySmall" muted style={styles.gap}>
                Remaining: {data.remainingDays} day(s)
              </AppText>
            </>
          ) : null}
        </Card>
      ) : (
        <Card style={styles.card}>
          <AppText variant="title">No deletion request</AppText>

          <AppText variant="bodySmall" muted style={styles.gap}>
            You can schedule account deletion below.
          </AppText>
        </Card>
      )}

      <View style={styles.list}>
        <AccordionCard title="What happens after scheduling?" defaultOpen>
          <AppText variant="bodySmall" muted>
            Localsewa creates a 30-day deletion request and revokes active API
            sessions. An eligible verified sign-in during the grace period can
            cancel the pending request. After the due date, backend cleanup
            finalizes the account according to the server deletion lifecycle.
          </AppText>
        </AccordionCard>

        <AccordionCard title="Important subscription note">
          <AppText variant="bodySmall" muted>
            Provider membership/subscription cleanup is a backend
            responsibility. Do not use account deletion as a substitute for
            managing a subscription. Provider billing behavior should be
            verified separately before relying on deletion to stop renewal.
          </AppText>
        </AccordionCard>
      </View>

      {!pending ? (
        <Card style={styles.dangerCard}>
          <AppText variant="title" color={theme.colors.error}>
            Schedule deletion
          </AppText>

          <AppText variant="bodySmall" muted style={styles.gap}>
            Choose one verification method. Nothing is scheduled until the final
            button succeeds.
          </AppText>

          {screenError ? (
            <View style={styles.gapLarge}>
              <AlertBanner variant="error">{screenError}</AlertBanner>
            </View>
          ) : null}

          <View style={styles.modeRow}>
            <View style={styles.modeAction}>
              <Button
                label="Password"
                variant={mode === 'password' ? 'primary' : 'outline'}
                onPress={() => {
                  setMode('password');
                  setOtp('');
                  setConfirmPhrase('');
                  setScreenError(null);
                }}
                fullWidth
              />
            </View>

            <View style={styles.modeAction}>
              <Button
                label="Email OTP"
                variant={mode === 'otp' ? 'primary' : 'outline'}
                disabled={!profile?.emailVerified}
                onPress={() => {
                  setMode('otp');
                  setPassword('');
                  setConfirmPhrase('');
                  setScreenError(null);
                }}
                fullWidth
              />
            </View>
          </View>

          <View style={styles.form}>
            {mode === 'password' ? (
              <PasswordInput
                label="Account password"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                maxLength={72}
              />
            ) : (
              <>
                {!otpSent ? (
                  <Button
                    label="Send deletion code"
                    variant="outline"
                    loading={requestOtp.isPending}
                    onPress={sendOtp}
                    fullWidth
                  />
                ) : (
                  <>
                    <AlertBanner variant="warning">
                      Deletion verification code sent
                      {maskedEmail
                        ? ` to ${maskedEmail}`
                        : ' to your verified email'}
                      .
                    </AlertBanner>

                    <Input
                      label="6-digit deletion code"
                      placeholder="000000"
                      value={otp}
                      onChangeText={value => setOtp(value.replace(/\D/g, ''))}
                      keyboardType="number-pad"
                      maxLength={6}
                      textAlign="center"
                      style={styles.otp}
                    />

                    <SecurityOtpStatus seconds={resendIn} onTick={onTick} />

                    <Button
                      label="Resend deletion code"
                      variant="secondary"
                      disabled={resendIn > 0}
                      loading={requestOtp.isPending}
                      onPress={sendOtp}
                      fullWidth
                    />
                  </>
                )}
              </>
            )}

            <Input
              label='Type "DELETE" to confirm'
              placeholder="DELETE"
              value={confirmPhrase}
              onChangeText={setConfirmPhrase}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
            />

            <AlertBanner variant="warning">
              This is a real account action. Use a disposable/test account for
              QA. Scheduling deletion revokes active sessions immediately.
            </AlertBanner>

            <Button
              label="Schedule account deletion"
              variant="destructive"
              loading={schedule.isPending}
              disabled={
                confirmPhrase.trim() !== 'DELETE' ||
                (mode === 'otp' && !otpSent)
              }
              onPress={scheduleDeletion}
              fullWidth
            />
          </View>
        </Card>
      ) : (
        <Card style={styles.warningCard}>
          <AppText variant="label" color={theme.colors.warning}>
            Recovery period active
          </AppText>

          <AppText variant="bodySmall" muted style={styles.gap}>
            This build does not add a separate cancel-deletion button because
            the current customer backend restores eligible pending deletion via
            verified sign-in during the grace period.
          </AppText>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  card: {
    marginTop: spacing[6],
  },
  gap: {
    marginTop: spacing[3],
  },
  gapLarge: {
    marginTop: spacing[4],
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  dangerCard: {
    marginTop: spacing[5],
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[5],
  },
  modeAction: {
    flex: 1,
  },
  form: {
    gap: spacing[4],
    marginTop: spacing[5],
  },
  otp: {
    fontSize: 24,
    letterSpacing: 8,
  },
  warningCard: {
    marginTop: spacing[5],
  },
});
