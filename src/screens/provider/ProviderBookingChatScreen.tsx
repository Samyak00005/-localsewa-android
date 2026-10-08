import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '../../api/apiClient';
import { isAmbiguousChatSendError } from '../../api/chatApi';
import { ChatMessageBubble } from '../../components/customer';
import { AppIcon, iconSize } from '../../components/icons';
import { ProviderHeader } from '../../components/provider';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { useBookingChat, useSendChatMessage } from '../../hooks/useChat';
import { useProviderBookings } from '../../hooks/useProviderWorkspace';
import { ProviderStackParamList } from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { ChatMessage } from '../../types/chat';

type Props = NativeStackScreenProps<
  ProviderStackParamList,
  'ProviderBookingChat'
>;

function chatDateKey(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, '0'),
    String(parsed.getDate()).padStart(2, '0'),
  ].join('-');
}

function chatDateLabel(value: string): string {
  const key = chatDateKey(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!match) {
    return key;
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = Number(match[2]);
  const year = Number(match[1]);
  const currentYear = new Date().getFullYear();

  return `${Number(match[3])} ${months[month - 1] ?? match[2]}${
    year === currentYear ? '' : ` ${year}`
  }`;
}

export function ProviderBookingChatScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const bookingId = route.params.bookingId;
  const { data: bookings = [] } = useProviderBookings();
  const booking = useMemo(
    () => bookings.find(item => item.id === bookingId),
    [bookings, bookingId],
  );

  const { data, isLoading, error, refetch, isRefetching } =
    useBookingChat(bookingId);
  const send = useSendChatMessage(bookingId);

  const [draft, setDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [deliveryUncertain, setDeliveryUncertain] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const messages = data?.messages ?? [];
  const counterpartName =
    data?.counterpart?.name || booking?.customerName || 'Customer';
  const counterpartImage =
    data?.counterpart?.imageUrl || booking?.customerImage;
  const chatAllowed = booking?.chatEnabled ?? true;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: false });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages.length]);

  async function sendMessage() {
    const clean = draft.trim();

    if (!clean) {
      return;
    }

    setLocalError(null);

    try {
      await send.mutateAsync(clean);
      setDraft('');
      setDeliveryUncertain(false);
    } catch (mutationError) {
      if (isAmbiguousChatSendError(mutationError)) {
        setDeliveryUncertain(true);
        setLocalError(
          'Message delivery is uncertain. Refresh the chat and check history before sending it again.',
        );
        return;
      }

      setLocalError(errorMessage(mutationError));
    }
  }

  async function refreshAfterUncertain() {
    setLocalError(null);

    try {
      const result = await refetch();
      const myMessages = (result.data?.messages ?? []).filter(
        item => item.sentByMe,
      );
      const latestMine = myMessages[myMessages.length - 1];

      if (latestMine && latestMine.message.trim() === draft.trim()) {
        setDraft('');
      }

      setDeliveryUncertain(false);
    } catch (refreshError) {
      setLocalError(errorMessage(refreshError));
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}> 
      <ProviderHeader />

      <KeyboardAvoidingView
        style={styles.shell}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      >
        <View
          style={[
            styles.identityBar,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.colors.surfaceMuted,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <AppIcon
              name="chevronLeft"
              size={iconSize.sm}
              color={theme.colors.primary}
            />
          </Pressable>

          <Avatar
            source={counterpartImage ? { uri: counterpartImage } : undefined}
            initials={counterpartName}
            size="md"
          />

          <View style={styles.flex}>
            <AppText variant="title" numberOfLines={1}>
              {counterpartName}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {booking?.serviceName || 'Private booking chat'}
            </AppText>
          </View>

          {booking?.chatEnabled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open call preview"
              onPress={() =>
                navigation.navigate('ProviderVoiceCallPreview', { bookingId })
              }
              style={({ pressed }) => [
                styles.callButton,
                {
                  backgroundColor: theme.colors.secondary,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <AppIcon
                name="phone"
                size={iconSize.sm}
                color={theme.colors.primary}
              />
            </Pressable>
          ) : null}
        </View>

        {!chatAllowed ? (
          <View style={styles.centerContent}>
            <Card style={styles.stateCard}>
              <View
                style={[
                  styles.stateIcon,
                  { backgroundColor: theme.colors.surfaceMuted },
                ]}
              >
                <AppIcon
                  name="message"
                  size={iconSize.md}
                  color={theme.colors.textMuted}
                />
              </View>
              <AppText variant="title" style={styles.stateTitle}>
                Chat unavailable
              </AppText>
              <AppText variant="bodySmall" muted style={styles.stateText}>
                Chat is available only while this booking is accepted or in progress.
              </AppText>
            </Card>
          </View>
        ) : isLoading ? (
          <View style={styles.loading}>
            <Skeleton width="62%" height={64} />
            <Skeleton width="70%" height={76} style={styles.rightSkeleton} />
            <Skeleton width="55%" height={58} />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
            <Button
              label="Retry"
              loading={isRefetching}
              onPress={() => refetch()}
              fullWidth
            />
          </View>
        ) : (
          <>
            {localError ? (
              <View style={styles.bannerWrap}>
                <AlertBanner variant={deliveryUncertain ? 'warning' : 'error'}>
                  {localError}
                </AlertBanner>
                {deliveryUncertain ? (
                  <Button
                    label="Refresh chat before retrying"
                    variant="outline"
                    loading={isRefetching}
                    onPress={refreshAfterUncertain}
                    fullWidth
                  />
                ) : null}
              </View>
            ) : null}

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={item => String(item.id)}
              renderItem={({ item, index }) => {
                const previous = index > 0 ? messages[index - 1] : null;
                const showDate =
                  !previous ||
                  chatDateKey(previous.createdAt) !== chatDateKey(item.createdAt);

                return (
                  <>
                    {showDate ? (
                      <ChatDateSeparator label={chatDateLabel(item.createdAt)} />
                    ) : null}
                    <ChatMessageBubble item={item} />
                  </>
                );
              }}
              style={styles.list}
              contentContainerStyle={[
                styles.listContent,
                !messages.length && styles.emptyList,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (messages.length) {
                  listRef.current?.scrollToEnd({ animated: true });
                }
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <View
                    style={[
                      styles.emptyIcon,
                      { backgroundColor: theme.colors.secondary },
                    ]}
                  >
                    <AppIcon
                      name="message"
                      size={iconSize.lg}
                      color={theme.colors.primary}
                    />
                  </View>
                  <AppText variant="title" style={styles.stateTitle}>
                    Start the conversation
                  </AppText>
                  <AppText variant="bodySmall" muted style={styles.stateText}>
                    This chat is private to this booking and its participants.
                  </AppText>
                </View>
              }
            />

            <View
              style={[
                styles.composer,
                {
                  borderTopColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  paddingBottom: keyboardVisible
                    ? spacing[2]
                    : Math.max(insets.bottom, spacing[2]),
                },
              ]}
            >
              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Message customer"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  maxLength={1000}
                  editable={!send.isPending && !deliveryUncertain}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send message"
                disabled={send.isPending || deliveryUncertain || !draft.trim()}
                onPress={sendMessage}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity:
                      send.isPending || deliveryUncertain || !draft.trim()
                        ? 0.42
                        : pressed
                        ? 0.76
                        : 1,
                  },
                ]}
              >
                <AppIcon name="send" size={iconSize.sm} color="#FFFFFF" />
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function ChatDateSeparator({
  label,
}: {
  label: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={styles.dateSeparator}>
      <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
      <AppText variant="caption" muted style={styles.dateLabel}>
        {label}
      </AppText>
      <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  shell: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  identityBar: {
    minHeight: 72,
    borderBottomWidth: 1,
    paddingHorizontal: layout.screenHorizontal,
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: layout.screenHorizontal,
  },
  stateCard: {
    padding: spacing[5],
    alignItems: 'center',
  },
  stateIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: { marginTop: spacing[3], textAlign: 'center' },
  stateText: { marginTop: spacing[2], textAlign: 'center' },
  loading: { flex: 1, padding: layout.screenHorizontal, paddingTop: spacing[6] },
  rightSkeleton: { alignSelf: 'flex-end', marginVertical: spacing[3] },
  bannerWrap: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: layout.screenHorizontal,
    paddingVertical: spacing[4],
  },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingHorizontal: spacing[6] },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSeparator: {
    marginVertical: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dateLabel: {
    flexShrink: 0,
  },
  composer: {
    borderTopWidth: 1,
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 112,
    borderWidth: 1,
    borderRadius: radius.lg,
    justifyContent: 'center',
  },
  input: {
    minHeight: 42,
    maxHeight: 108,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
