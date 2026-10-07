# Localsewa Android v1.8.2 — Booking Chat

## Summary

v1.8.2 connects the Customer Android app to Localsewa's real booking-scoped
chat backend.

Chat is not a generic customer/provider DM system. It belongs to one booking
and is available only while that booking is in a backend-authorized chat state.

Google Sign-In remains on hold.

## Version

`v1.8.2`

## Real backend routes

### Chat history

```text
GET /api/bookings/{bookingId}/messages
Authorization: Bearer <token>
```

The backend:

- checks that the user is a participant in the booking
- allows chat only for ACCEPTED or IN_PROGRESS
- returns booking messages
- returns counterpart information
- can return combined message/call timeline information
- marks incoming messages/read notifications as read

### Send message

```text
POST /api/bookings/{bookingId}/messages
Authorization: Bearer <token>

{
  "message": "..."
}
```

Message limit:

```text
1–1000 characters
```

## Backend message payload used by Android

The active backend helper returns:

```text
id
message
sentByMe
senderRole
createdAt
readAt
```

Android uses `sentByMe` as the authoritative message alignment flag.

## Chat eligibility

Booking Details shows `Open chat` only when:

```text
chatEnabled = true
```

The backend currently enables booking chat only during:

```text
ACCEPTED
IN_PROGRESS
```

The chat route itself is still protected by the backend; the Android flag is
not treated as an authorization mechanism.

## Native chat UI

v1.8.2 includes:

- full-height native chat screen
- provider/counterpart header
- circular provider image/avatar
- booking service + booking code context
- customer messages aligned right
- outgoing message bubble uses active Customer green
- incoming messages aligned left
- sent/read text for outgoing messages
- message history scrolling
- empty conversation state
- anchored bottom composer
- multiline input
- 1,000-character limit
- rounded send control
- Android keyboard handling
- Android safe-area handling

No page-level custom Back row is added. Use Android/navigation back.

## Refresh behavior

The active backend does not expose WebSocket/FCM message delivery for this
screen.

Therefore v1.8.2 performs lightweight foreground history polling every 4
seconds while the Chat screen is mounted.

Background polling is disabled.

This is a temporary native delivery strategy until a push/realtime transport is
implemented.

## Critical duplicate-message rule

The current message POST handler does NOT consume a message request-id /
idempotency key.

Therefore:

- message POST has mutation retry = 0
- the app does not automatically resend a failed message
- a normal server validation error is shown
- a network-level ambiguous failure is shown as **delivery uncertain**
- the Send control is temporarily disabled
- user must refresh chat history before trying again

This prevents the app from blindly creating duplicate messages after a lost
success response.

## Files added

```text
src/types/chat.ts
src/api/chatApi.ts
src/hooks/useChat.ts

src/components/customer/ChatMessageBubble.tsx

src/screens/customer/BookingChatScreen.tsx
```

## Files replaced

```text
src/components/customer/index.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/screens/customer/BookingDetailsScreen.tsx
src/screens/customer/index.ts
```

## Dependencies

No new npm package is required.

The build uses packages already present:

```text
@tanstack/react-query
@react-navigation/native
@react-navigation/native-stack
react-native-safe-area-context
```

## Install

1. Copy/replace the v1.8.2 files in the existing project.
2. No `npm install` command is required.
3. Run the app from Android Studio.

## QA requirement

To test real chat, use a booking whose backend state is:

```text
ACCEPTED
```

or:

```text
IN_PROGRESS
```

A PENDING, COMPLETED, REJECTED, CANCELLED or NOT_COMPLETED booking is not a
valid chat test fixture.

## QA checklist

### Booking Details

1. Open an ACCEPTED or IN_PROGRESS booking.
2. Confirm `Open chat` appears.
3. Open a PENDING/closed booking.
4. Confirm Chat action is absent when `chatEnabled` is false.

### Chat history

1. Open Chat.
2. Confirm existing messages load.
3. Confirm outgoing and incoming alignment.
4. Confirm provider/counterpart identity.
5. Confirm customer outgoing bubble uses Customer green.
6. Confirm timestamps render.
7. Confirm outgoing read state changes after counterpart reads.

### Send

1. Send a short text.
2. Confirm it appears after the server response/refetch.
3. Send multiline text.
4. Confirm empty text cannot send.
5. Confirm the input enforces max 1,000 characters.

### Read state

Opening Chat calls the backend history route. Incoming message/read notification
state should update server-side as defined by the backend.

### Network ambiguity

Do not intentionally spam a production booking.

If a real network failure happens during Send:

1. App should show delivery-uncertain warning.
2. Send should not auto-retry.
3. Press `Refresh chat before retrying`.
4. Inspect history before resending.

## Known limitations

- No WebSocket transport.
- No FCM message push.
- Polling is foreground-only.
- Backend history currently returns the complete booking chat; there is no
  cursor/pagination in the active handler.
- No message edit/delete.
- No attachment/media messages.
- No typing indicator.
- No delivery retry/idempotency key.
- Voice calling is not part of v1.8.2.
- Call timeline events returned by backend are intentionally not rendered yet.
- Google Sign-In remains on hold.

## Next milestone

### v1.9.0 — Customer Notifications

Next we will connect:

```text
GET /notifications
PATCH /notifications/{id}/read
PATCH /notifications/read-all
```

Planned native behavior:

- notification list
- unread count
- mark one as read
- mark all as read
- booking notification → Customer/Provider role-aware destination
- chat notification → correct booking Chat screen
- action URL mapping to native routes
- foreground polling

Important: the reviewed backend currently has no FCM/device-token registration
or native push sender. v1.9.0 will first implement reliable in-app native
notifications; background/killed-app push requires a separate backend/native
push milestone.

After Notifications:

```text
Customer Profile + Account Settings
Help & Support
Terms & Conditions
Privacy Policy
Account Security / Deletion
```

Then the real Provider workspace begins.
