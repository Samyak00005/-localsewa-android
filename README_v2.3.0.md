# Localsewa Android v2.3.0 — Provider Request Details + Chat Fixes

Apply this incremental feature patch over **v2.2.3**.

## Provider Request Details

- Added a real `ProviderRequestDetails` stack screen.
- Requests cards now expose a compact details entry control without changing the card's data/state actions.
- Details screen includes:
  - booking/request code
  - service name
  - catalog starting price or custom-service state
  - booking status
  - customer avatar/name when backend permits the image
  - date and time
  - service location + distance + Maps route when returned by backend
  - Chat and Call actions while the booking is communication-enabled
  - customer note
  - rejection / cancellation / not-completed reason
  - completed customer rating/review
  - real provider lifecycle actions for Pending, Accepted, and In Progress states
- Reject and Not Completed still require a reason.
- Status mutations use the existing backend status API and existing provider cache invalidation.
- No fake status timeline/history was added because the current booking payload does not expose a status-history feed.

## Provider Chat fixes

1. Added a back button immediately before the customer avatar in the chat identity row.
2. Added date separators between message days using the same date grouping logic already used by Customer chat.
3. Fixed Android bottom safe-area handling for the composer:
   - when the keyboard is closed, the composer reserves the real bottom inset
   - when the keyboard is open, the composer uses normal compact padding
   - the message input/send button should no longer sit behind the Android navigation/gesture area
4. Customer booking image is also used as an avatar fallback when chat counterpart data does not include an image.

## Existing boundaries retained

- Call remains the existing voice-call preview/entry flow; real WebRTC/audio is still deferred.
- Customer profile images for closed bookings may still fall back to initials because the backend intentionally exposes `customerImage` only while chat is enabled.
- No Customer UI files were changed.

## Version

- versionName: `2.3.0`
- versionCode: `20300`
