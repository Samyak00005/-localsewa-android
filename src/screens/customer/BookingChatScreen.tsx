import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  AppIcon,
  iconSize,
} from '../../components/icons';
import {
  isAmbiguousChatSendError,
} from '../../api/chatApi';
import {
  ChatMessageBubble,
} from '../../components/customer';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import {
  useCustomerBookings,
} from '../../hooks/useCustomerData';
import {
  useBookingChat,
  useSendChatMessage,
} from '../../hooks/useChat';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  ChatMessage,
} from '../../types/chat';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'BookingChat'
  >;

export function BookingChatScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();
  const insets =
    useSafeAreaInsets();

  const listRef =
    useRef<
      FlatList<ChatMessage>
    >(null);

  const bookingId =
    route.params.bookingId;

  const {
    data: bookings = [],
  } = useCustomerBookings();

  const booking =
    useMemo(
      () =>
        bookings.find(
          item =>
            item.id ===
            bookingId,
        ),
      [bookings, bookingId],
    );

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useBookingChat(
    bookingId,
  );

  const send =
    useSendChatMessage(
      bookingId,
    );

  const [draft, setDraft] =
    useState('');
  const [
    localError,
    setLocalError,
  ] =
    useState<string | null>(
      null,
    );
  const [
    deliveryUncertain,
    setDeliveryUncertain,
  ] = useState(false);

  const messages =
    data?.messages ?? [];

  const counterpartName =
    data?.counterpart?.name ||
    booking?.providerName ||
    'Service provider';

  const counterpartImage =
    data?.counterpart
      ?.imageUrl ||
    booking?.providerImage;

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    const timer =
      setTimeout(() => {
        listRef.current?.scrollToEnd({
          animated: false,
        });
      }, 80);

    return () =>
      clearTimeout(timer);
  }, [messages.length]);

  async function sendMessage() {
    const clean =
      draft.trim();

    if (!clean) {
      return;
    }

    setLocalError(null);

    try {
      await send.mutateAsync(
        clean,
      );
      setDraft('');
      setDeliveryUncertain(
        false,
      );
    } catch (
      mutationError
    ) {
      if (
        isAmbiguousChatSendError(
          mutationError,
        )
      ) {
        setDeliveryUncertain(
          true,
        );
        setLocalError(
          'Message delivery is uncertain because the network response was lost. Refresh the chat and check history before sending it again.',
        );
        return;
      }

      setLocalError(
        errorMessage(
          mutationError,
        ),
      );
    }
  }

  async function refreshAfterUncertain() {
    setLocalError(null);

    try {
      const result =
        await refetch();

      const myMessages =
        (
          result.data
            ?.messages ??
          []
        ).filter(
          item =>
            item.sentByMe,
        );

      const latest =
        myMessages[
          myMessages.length - 1
        ];

      if (
        latest &&
        latest.message.trim() ===
          draft.trim()
      ) {
        setDraft('');
      }

      setDeliveryUncertain(
        false,
      );
    } catch (
      refreshError
    ) {
      setLocalError(
        errorMessage(
          refreshError,
        ),
      );
    }
  }

  const chatAllowed =
    booking?.chatEnabled ??
    true;

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
      behavior={
        Platform.OS ===
        'android'
          ? 'height'
          : 'padding'
      }>
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              theme.colors.border,
            backgroundColor:
              theme.colors.surface,
            paddingTop:
              Math.max(
                insets.top,
                spacing[2],
              ),
          },
        ]}>
        {counterpartImage ? (
          <Image
            source={{
              uri:
                counterpartImage,
            }}
            style={styles.avatar}
          />
        ) : (
          <Avatar
            initials={
              counterpartName
            }
            size="md"
          />
        )}

        <View style={styles.headerCopy}>
          <AppText
            variant="title"
            numberOfLines={1}>
            {counterpartName}
          </AppText>

          <AppText
            variant="caption"
            muted
            numberOfLines={1}>
            {booking
              ? `${booking.serviceName} · ${booking.bookingCode}`
              : 'Booking chat'}
          </AppText>
        </View>

        {booking?.chatEnabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice call preview"
            onPress={() =>
              navigation.navigate(
                'VoiceCallPreview',
                {
                  bookingId,
                },
              )
            }
            style={({pressed}) => [
              styles.callButton,
              {
                backgroundColor:
                  theme.colors.secondary,
                borderColor:
                  theme.colors.primary,
                opacity:
                  pressed ? 0.82 : 1,
              },
            ]}>
            <AppIcon
              name="phone"
              size={iconSize.sm}
              color={theme.colors.primary}
            />
          </Pressable>
        ) : null}
      </View>

      {!chatAllowed ? (
        <View
          style={
            styles.centerContent
          }>
          <Card>
            <AppText variant="title">
              Chat unavailable
            </AppText>

            <AppText
              variant="bodySmall"
              muted
              style={
                styles.smallGap
              }>
              This booking is no longer in a chat-enabled state.
            </AppText>
          </Card>
        </View>
      ) : isLoading ? (
        <View style={styles.loading}>
          <Skeleton
            width="62%"
            height={64}
          />
          <Skeleton
            width="70%"
            height={76}
            style={
              styles.rightSkeleton
            }
          />
          <Skeleton
            width="55%"
            height={58}
          />
        </View>
      ) : error ? (
        <View
          style={
            styles.centerContent
          }>
          <AlertBanner variant="error">
            {errorMessage(
              error,
            )}
          </AlertBanner>

          <Button
            label="Retry"
            loading={
              isRefetching
            }
            onPress={() => {
              refetch();
            }}
            fullWidth
          />
        </View>
      ) : (
        <>
          {localError ? (
            <View
              style={
                styles.bannerWrap
              }>
              <AlertBanner
                variant={
                  deliveryUncertain
                    ? 'warning'
                    : 'error'
                }>
                {localError}
              </AlertBanner>

              {deliveryUncertain ? (
                <Button
                  label="Refresh chat before retrying"
                  variant="outline"
                  loading={
                    isRefetching
                  }
                  onPress={
                    refreshAfterUncertain
                  }
                  fullWidth
                />
              ) : null}
            </View>
          ) : null}

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item =>
              String(item.id)
            }
            renderItem={({
              item,
            }) => (
              <ChatMessageBubble
                item={item}
              />
            )}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              !messages.length &&
                styles.emptyList,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (
                messages.length
              ) {
                listRef.current?.scrollToEnd({
                  animated: true,
                });
              }
            }}
            ListEmptyComponent={
              <View
                style={styles.empty}>
                <AppText variant="title">
                  Start the conversation
                </AppText>

                <AppText
                  variant="bodySmall"
                  muted
                  style={
                    styles.smallGap
                  }>
                  Chat is private to this booking and its participants.
                </AppText>
              </View>
            }
          />

          <View
            style={[
              styles.composer,
              {
                borderTopColor:
                  theme.colors.border,
                backgroundColor:
                  theme.colors.surface,
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    spacing[2],
                  ),
              },
            ]}>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor:
                    theme.colors.border,
                  backgroundColor:
                    theme.colors.background,
                },
              ]}>
              <TextInput
                value={draft}
                onChangeText={
                  setDraft
                }
                placeholder="Message"
                placeholderTextColor={
                  theme.colors.textMuted
                }
                multiline
                maxLength={1000}
                editable={
                  !send.isPending &&
                  !deliveryUncertain
                }
                style={[
                  styles.input,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={
                send.isPending ||
                deliveryUncertain ||
                !draft.trim()
              }
              onPress={
                sendMessage
              }
              style={({pressed}) => [
                styles.sendButton,
                {
                  backgroundColor:
                    theme.colors.primary,
                  opacity:
                    send.isPending ||
                    deliveryUncertain ||
                    !draft.trim()
                      ? 0.45
                      : pressed
                        ? 0.8
                        : 1,
                },
              ]}>
              <AppIcon
                name="send"
                size={iconSize.sm}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: 76,
    borderBottomWidth: 1,
    paddingHorizontal:
      layout.screenHorizontal,
    paddingBottom: spacing[3],
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
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    gap: spacing[3],
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
  },
  rightSkeleton: {
    alignSelf: 'flex-end',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[3],
    paddingHorizontal:
      layout.screenHorizontal,
  },
  bannerWrap: {
    gap: spacing[2],
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[3],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingVertical:
      spacing[4],
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal:
      spacing[5],
  },
  smallGap: {
    marginTop: spacing[1],
  },
  composer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[2],
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    maxHeight: 124,
    borderWidth: 1,
    borderRadius:
      radius.xl,
    justifyContent: 'center',
  },
  input: {
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal:
      spacing[3],
    paddingVertical:
      spacing[2],
    fontSize: 15,
    lineHeight: 20,
    textAlignVertical:
      'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent:
      'center',
  },
});
