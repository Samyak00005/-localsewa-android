import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { isAmbiguousChatSendError } from '../../api/chatApi';
import { ChatMessageBubble } from '../../components/customer';
import { AppIcon, iconSize } from '../../components/icons';
import {
  CustomerDetailBottomBar,
  CustomerHeader,
} from '../../components/navigation';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { useBookingChat, useSendChatMessage } from '../../hooks/useChat';
import { useCustomerBookings } from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { ChatMessage } from '../../types/chat';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookingChat'>;

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

export function BookingChatScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const bookingId = route.params.bookingId;
  const { data: bookings = [] } = useCustomerBookings();

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
    data?.counterpart?.name || booking?.providerName || 'Service provider';
  const counterpartImage = data?.counterpart?.imageUrl || booking?.providerImage;

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
          'Message delivery is uncertain. Refresh the chat and check history before sending the same message again.',
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
      const latest = myMessages[myMessages.length - 1];

      if (latest && latest.message.trim() === draft.trim()) {
        setDraft('');
      }

      setDeliveryUncertain(false);
    } catch (refreshError) {
      setLocalError(errorMessage(refreshError));
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

  const chatAllowed = booking?.chatEnabled ?? true;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <CustomerHeader routeName="CustomerBookings" />

      <KeyboardAvoidingView
        style={styles.chatShell}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          {counterpartImage ? (
            <Image
              source={{ uri: counterpartImage }}
              style={styles.avatar}
            />
          ) : (
            <Avatar initials={counterpartName} size="md" />
          )}

          <View style={styles.headerCopy}>
            <AppText variant="title" numberOfLines={1}>
              {counterpartName}
            </AppText>

            <AppText variant="caption" muted numberOfLines={1}>
              {booking
                ? booking.serviceName
                : 'Private booking chat'}
            </AppText>
          </View>

          {booking?.chatEnabled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voice call preview"
              onPress={() =>
                navigation.navigate('VoiceCallPreview', {
                  bookingId,
                })
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
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                  },
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
                This booking is no longer in a chat-enabled state. Open Booking
                Details to review its current status.
              </AppText>

              <Button
                label="Open booking details"
                variant="outline"
                onPress={() =>
                  navigation.navigate('BookingDetails', {
                    bookingId,
                  })
                }
                fullWidth
                style={styles.stateAction}
              />
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
              onPress={() => {
                refetch();
              }}
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
                      {
                        backgroundColor: theme.colors.secondary,
                      },
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
                  placeholder="Message"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  maxLength={1000}
                  editable={!send.isPending && !deliveryUncertain}
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                    },
                  ]}
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

      {!keyboardVisible ? (
        <CustomerDetailBottomBar
          activeRoute="CustomerBookings"
          onNavigate={navigateTab}
        />
      ) : null}
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
      <View
        style={[
          styles.dateLine,
          {
            backgroundColor: theme.colors.border,
          },
        ]}
      />

      <AppText variant="caption" muted style={styles.dateLabel}>
        {label}
      </AppText>

      <View
        style={[
          styles.dateLine,
          {
            backgroundColor: theme.colors.border,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  chatShell: {
    flex: 1,
  },
  header: {
    minHeight: 72,
    borderBottomWidth: 1,
    paddingHorizontal: layout.screenHorizontal,
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    gap: spacing[3],
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
  },
  rightSkeleton: {
    alignSelf: 'flex-end',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[3],
    paddingHorizontal: layout.screenHorizontal,
  },
  stateCard: {
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  stateIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    marginTop: spacing[3],
    textAlign: 'center',
  },
  stateText: {
    marginTop: spacing[2],
    textAlign: 'center',
    maxWidth: 290,
  },
  stateAction: {
    marginTop: spacing[4],
  },
  bannerWrap: {
    gap: spacing[2],
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[3],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: layout.screenHorizontal,
    paddingVertical: spacing[4],
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing[5],
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: layout.screenHorizontal,
    paddingVertical: spacing[2],
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    maxHeight: 124,
    borderWidth: 1,
    borderRadius: radius.xl,
    justifyContent: 'center',
  },
  input: {
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
