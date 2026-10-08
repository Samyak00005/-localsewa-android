import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAuth } from '../../auth';
import { SecurityOtpStatus } from '../../components/account';
import { PasswordInput } from '../../components/auth';
import { AppIcon, iconSize } from '../../components/icons';
import {
  ProviderHeader,
  ProviderSubpageHeader,
} from '../../components/provider';
import {
  AlertBanner,
  AppText,
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
} from '../../components/ui';
import {
  useAccountDeletionStatus,
  useCustomerProfile,
} from '../../hooks/useAccount';
import {
  useRequestDeletionOtp,
  useScheduleAccountDeletion,
} from '../../hooks/useAccountSecurity';
import { ProviderStackParamList } from '../../navigation/types';
import { layout, shadows, spacing, useAppTheme } from '../../theme';
import { validateOtp } from '../../utils/authValidation';

type Props = NativeStackScreenProps<ProviderStackParamList, 'ProviderAccountDeletion'>;
type ConfirmationMode = 'password' | 'otp';

export function ProviderAccountDeletionScreen({
  navigation,
}: Props): React.JSX.Element {
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
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);

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

      // The backend revokes active sessions after scheduling deletion.
      await clearLocalSession();
    } catch (mutationError) {
      setScreenError(errorMessage(mutationError));
    }
  }

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <ProviderHeader />
      <ProviderSubpageHeader
        title="Account security"
        subtitle="Account deletion"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View
            style={[
              styles.headingIcon,
              {
                backgroundColor: '#FFF1F0',
              },
            ]}
          >
            <AppIcon
              name="trash"
              size={iconSize.md}
              color={theme.colors.error}
            />
          </View>

          <View style={styles.headingCopy}>
            <AppText variant="h2">Delete account</AppText>
            <AppText variant="bodySmall" muted style={styles.subtitle}>
              Review the recovery period and consequences before continuing.
            </AppText>
          </View>
        </View>

        {isLoading ? (
          <Card style={styles.statusCard}>
            <Skeleton width="45%" height={20} />
            <Skeleton width="78%" height={14} style={styles.gap} />
          </Card>
        ) : error ? (
          <View style={styles.statusCard}>
            <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
          </View>
        ) : data ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View>
                <AppText variant="caption" muted>
                  Account deletion
                </AppText>
                <AppText variant="title" style={styles.smallGap}>
                  Current status
                </AppText>
              </View>

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
              <View
                style={[
                  styles.pendingInfo,
                  {
                    backgroundColor: '#FFF8E8',
                  },
                ]}
              >
                <AppIcon name="clock" size={iconSize.sm} color="#9A6700" />

                <View style={styles.flex}>
                  <AppText variant="label" color="#7A5200">
                    30-day recovery period active
                  </AppText>
                  <AppText variant="caption" color="#7A6642" style={styles.smallGap}>
                    Scheduled for {data.scheduledFor ?? 'the deletion date'} ·{' '}
                    {data.remainingDays} day(s) remaining
                  </AppText>
                </View>
              </View>
            ) : (
              <AppText variant="bodySmall" muted style={styles.gap}>
                No pending deletion request is currently active.
              </AppText>
            )}
          </Card>
        ) : null}

        <View style={styles.infoList}>
          <View style={styles.infoBlock}>
            <AppText variant="label">What happens after you continue?</AppText>
            <AppText variant="caption" muted style={styles.smallGap}>
              Your account enters a 30-day recovery period and active sessions
              are signed out. Permanent deletion is finalized only after that
              recovery period ends.
            </AppText>
          </View>

          <View
            style={[
              styles.infoDivider,
              {
                backgroundColor: theme.colors.border,
              },
            ]}
          />

          <View style={styles.infoBlock}>
            <AppText variant="label">Can you recover the account?</AppText>
            <AppText variant="caption" muted style={styles.smallGap}>
              An eligible verified sign-in during the recovery period can
              cancel a pending deletion request. After permanent deletion is
              finalized, recovery is no longer available.
            </AppText>
          </View>

          <View
            style={[
              styles.infoDivider,
              {
                backgroundColor: theme.colors.border,
              },
            ]}
          />

          <View style={styles.infoBlock}>
            <AppText variant="label">Provider / Localsewa+ account</AppText>
            <AppText variant="caption" muted style={styles.smallGap}>
              If this account also has Provider access or Localsewa+, review the
              provider subscription status before deleting the account.
            </AppText>
          </View>
        </View>

        {!pending ? (
          <View style={styles.intentArea}>
            <AppText variant="label" color={theme.colors.error}>
              Are you sure you want to delete this account?
            </AppText>

            <AppText variant="caption" muted style={styles.smallGap}>
              Continue only if you understand that this starts the 30-day
              account deletion process and signs active sessions out.
            </AppText>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setScreenError(null);
                setDeletionModalVisible(true);
              }}
              hitSlop={8}
              style={({ pressed }) => [
                styles.intentLink,
                {
                  opacity: pressed ? 0.68 : 1,
                },
              ]}
            >
              <AppText variant="label" color={theme.colors.error}>
                Continue to account deletion
              </AppText>

              <AppIcon
                name="chevronRight"
                size={iconSize.sm}
                color={theme.colors.error}
              />
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.pendingNotice,
              {
                backgroundColor: '#FFF8E8',
                borderColor: '#F2D59B',
              },
            ]}
          >
            <AppText variant="label" color={theme.colors.warning}>
              Recovery period active
            </AppText>
            <AppText variant="caption" muted style={styles.smallGap}>
              A deletion request is already pending. Use the supported verified
              sign-in recovery path if you need to restore the account during
              the grace period.
            </AppText>
          </View>
        )}

      </ScrollView>

      <Modal
        transparent
        visible={deletionModalVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!schedule.isPending) {
            setDeletionModalVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              if (!schedule.isPending) {
                setDeletionModalVisible(false);
              }
            }}
          />

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
              },
              shadows.md,
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.flex}>
                <View style={styles.modalTitleRow}>
                  <View
                    style={[
                      styles.modalDangerIcon,
                      {
                        backgroundColor: '#FFF1F0',
                      },
                    ]}
                  >
                    <AppIcon
                      name="trash"
                      size={iconSize.sm}
                      color={theme.colors.error}
                    />
                  </View>

                  <View style={styles.flex}>
                    <AppText variant="title">
                      Confirm account deletion
                    </AppText>
                    <AppText variant="caption" muted style={styles.smallGap}>
                      Verify ownership before starting the 30-day recovery period.
                    </AppText>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close account deletion"
                disabled={schedule.isPending}
                onPress={() => setDeletionModalVisible(false)}
                style={[
                  styles.modalClose,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                  },
                ]}
              >
                <AppIcon
                  name="x"
                  size={iconSize.sm}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {screenError ? (
                <AlertBanner variant="error">{screenError}</AlertBanner>
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
                ) : !otpSent ? (
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
                      Verification code sent
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
                      label="Resend code"
                      variant="secondary"
                      disabled={resendIn > 0}
                      loading={requestOtp.isPending}
                      onPress={sendOtp}
                      fullWidth
                    />
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

                <View style={styles.sessionNote}>
                  <AppIcon
                    name="logOut"
                    size={iconSize.xs}
                    color={theme.colors.warning}
                  />

                  <AppText
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.sessionNoteText}
                  >
                    You’ll be signed out from every active Localsewa session after confirmation.
                  </AppText>
                </View>

                <Button
                  label="Begin deletion process"
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    marginTop: spacing[2],
  },
  statusCard: {
    marginTop: spacing[5],
    borderRadius: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  pendingInfo: {
    marginTop: spacing[4],
    borderRadius: 14,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  smallGap: {
    marginTop: spacing[1],
  },
  gap: {
    marginTop: spacing[3],
  },
  gapLarge: {
    marginTop: spacing[4],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[5],
  },
  dangerCard: {
    marginTop: spacing[5],
    borderRadius: 20,
  },
  dangerHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  dangerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoList: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[1],
  },
  infoBlock: {
    paddingVertical: spacing[3],
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
  },
  intentArea: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[1],
  },
  intentLink: {
    marginTop: spacing[3],
    minHeight: 42,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  pendingNotice: {
    marginTop: spacing[5],
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing[3],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,24,17,0.48)',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: spacing[5],
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '86%',
    alignSelf: 'center',
    borderRadius: 26,
    overflow: 'hidden',
  },
  modalHeader: {
    minHeight: 84,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  modalTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  modalDangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClose: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
  },
  sessionNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  sessionNoteText: {
    flex: 1,
    lineHeight: 18,
  },

  warningCard: {
    marginTop: spacing[5],
    borderRadius: 20,
  },
});
