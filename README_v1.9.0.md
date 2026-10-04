# Localsewa Android v1.9.0 — In-App Notifications + Call UI Preview

## Summary

v1.9.0 adds the first real native in-app notification experience and prepares
the voice-call UI requested for booking communication.

Two integrations are intentionally still ON HOLD:

1. Android push notifications / Firebase Cloud Messaging.
2. Actual voice calling / WebRTC signaling and audio.

This build uses the existing Localsewa notification database/API while the app
is open, and it provides call entry points plus a full-screen visual preview
without starting any real call.

## Version

`v1.9.0`

## Notifications backend

### List

```text
GET /api/notifications?limit=50
Authorization: Bearer <token>
```

The backend notification payload maps:

```text
id
type
title
message
actionUrl
entityType
entityId
read
readAt
createdAt
```

The list response also exposes:

```text
unreadCount
serverTime
```

### Mark one read

```text
PATCH /api/notifications/{id}/read
```

### Mark all read

```text
PATCH /api/notifications/read-all
```

## In-app notification behavior

v1.9.0 includes:

- Notifications secondary screen
- Home-screen Alerts entry
- unread badge/count
- latest 50 notifications
- unread visual state
- mark one as read when opened
- mark all as read
- loading/error/empty states
- foreground polling every 10 seconds
- optimistic read-state updates
- backend refresh after mutation

This is **not Android OS push**.

No notification permission is requested.

No Firebase SDK is installed.

No FCM token is generated or sent to the backend.

## Native routing

The notification router prefers:

```text
entityType + entityId
```

and uses `actionUrl` as routing context/fallback.

### Customer booking

Routes to:

```text
BookingDetails
```

### Customer chat

If the referenced booking currently has:

```text
chatEnabled = true
```

it routes to:

```text
BookingChat
```

If chat is no longer eligible, it safely opens Booking Details instead.

### Booking list

Booking activity without a specific resolvable booking ID opens:

```text
Customer Bookings tab
```

### Provider-target notification

If the URL/type clearly targets Provider and the account has Provider access,
the app switches to the Provider workspace.

Detailed Provider request deep-linking is deferred until the real Provider
booking/request stack exists.

## Voice call UI — preview only

Requested entry points are now present.

### Booking Chat

Top-right circular telephone control:

```text
☎
```

### Booking Details

The communication card now shows:

```text
Open chat | Call
```

side by side.

The Call action opens:

```text
VoiceCallPreviewScreen
```

## Full-screen call UI preview

Includes:

- full-screen dark Provider-style voice-call canvas
- provider name
- provider profile image/fallback avatar
- booking/service context
- explicit `VOICE CALL PREVIEW` status
- Mute visual toggle
- Speaker visual toggle
- End button

Important:

Mute/Speaker are UI states only.

They do NOT:

- request microphone permission
- route Android audio
- start WebRTC
- send signaling
- create a backend call record
- ring the provider
- work in background
- wake a killed app

This prevents the preview from pretending a real call exists.

## Call eligibility

Call UI entry points are currently shown alongside booking chat eligibility.

The reviewed backend allows chat/calls only during the same active
communication states:

```text
ACCEPTED
IN_PROGRESS
```

Actual call availability/config checks will be added when real calling resumes.

## AlertBanner fix

v1.9.0 also formally adds the `warning` variant to `AlertBanner`.

This supports the delivery-uncertain message state already used by Booking Chat.

## Files added

```text
src/types/notification.ts

src/api/notificationApi.ts

src/utils/notificationRoute.ts

src/hooks/useNotifications.ts

src/components/customer/NotificationRow.tsx

src/screens/customer/CustomerNotificationsScreen.tsx
src/screens/customer/VoiceCallPreviewScreen.tsx
```

## Files replaced

```text
src/components/ui/AlertBanner.tsx

src/components/customer/index.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/screens/customer/CustomerHomeScreen.tsx
src/screens/customer/BookingChatScreen.tsx
src/screens/customer/BookingDetailsScreen.tsx
src/screens/customer/index.ts
```

## Dependencies

No new npm package is required.

Do NOT install Firebase for this version.

Do NOT install WebRTC/calling packages for this version.

Keep existing packages from v1.8.x.

## Install

1. Stop/reload the running app.
2. Copy this ZIP contents into the existing project.
3. Replace matching files.
4. No npm install command is required.
5. Run through Android Studio.

## QA — Notifications

### Home

1. Login.
2. Open Customer Home.
3. Confirm `Alerts` appears at the top of the green hero.
4. If unread notifications exist, confirm count badge.
5. Tap Alerts.

### Notifications page

1. Confirm real backend notifications load.
2. Confirm unread rows are visually distinct.
3. Tap an unread row.
4. Confirm unread count decreases.
5. Return and confirm read state persists.
6. Use `Read all`.
7. Confirm unread count becomes zero.
8. Wait at least 10 seconds and verify feed can refresh while screen/app is active.

### Booking notification

1. Tap a notification with a booking entity/action.
2. Confirm Booking Details opens.

### Chat notification

1. Use an ACCEPTED/IN_PROGRESS booking chat notification.
2. Confirm Booking Chat opens.
3. For a closed booking, confirm the app falls back to Booking Details rather
   than forcing a stale chat route.

### Provider notification

For a multi-role test account, a clearly Provider-targeted notification should
switch to the Provider workspace.

Detailed Provider request routing remains deferred.

## QA — Call UI preview

### Booking Details

1. Open an ACCEPTED/IN_PROGRESS booking.
2. Confirm communication card shows:
   - Open chat
   - Call
3. Tap Call.
4. Confirm full-screen call preview opens.
5. Toggle Mute.
6. Toggle Speaker.
7. Tap End.
8. Confirm app returns to Booking Details.

### Booking Chat

1. Open eligible Booking Chat.
2. Confirm telephone control appears top-right.
3. Tap it.
4. Confirm same call preview opens.

### Non-eligible booking

PENDING/COMPLETED/CANCELLED/REJECTED/NOT_COMPLETED bookings must not get these
communication actions through the `chatEnabled` path.

## Explicitly held

### Android push / FCM

ON HOLD.

Later real push requires:

- Firebase/FCM Android setup
- POST/refresh device-token backend contract
- server-side push sender
- Android 13+ notification permission
- notification channels
- foreground/background/killed-app handlers
- token refresh/revocation
- native deep-link payload

None is added in v1.9.0.

### Actual voice calling

ON HOLD.

Later real calling requires:

- call availability/config endpoint integration
- backend start/incoming/state/signaling routes
- WebRTC native media
- microphone permission
- speaker/earpiece audio routing
- mute state connected to media tracks
- ringtone
- accept/decline/end
- app lifecycle
- background/incoming call behavior
- TURN validation for difficult networks

None is activated in v1.9.0.

## Known limitations

- Notifications are in-app only.
- Foreground polling is used instead of push.
- Feed currently loads latest 50; incremental `after_id` pagination is not
  exposed in this UI yet.
- Provider notification deep-linking can switch workspace but Provider request
  details are not yet implemented.
- Call UI uses temporary text/telephone glyph controls until the final icon
  system is introduced.
- Actual calling does not occur.
- Google Sign-In remains on hold.
- Customer Profile still needs the full account/settings redesign.

## Next milestone

### v1.10.0 — Customer Profile & Account Settings

Next we will remove the remaining Customer Profile placeholder and build the
real account workspace.

Planned:

```text
Customer Profile
Account details
Profile editing
Profile image
Default location
Role switch
Account Security
Change Password
Verified Email change
Active sessions / Logout all where supported
Help & Support entry
Terms & Conditions entry
Privacy Policy entry
Account deletion entry
```

We will keep the already approved clean Android design language for Help,
Terms and Privacy.

After the Customer account/support pages are stable, the next major workstream
is the real Provider workspace.
