# Localsewa Android v1.10.8 — Booking Details UI Polish

## Base

Apply this build over:

```text
v1.10.7 — Customer Bookings UI Polish
```

No new npm package is required.

## Purpose

Booking Details is the full view opened after a Customer taps a booking card.

This update keeps only useful booking information and valid actions, using the
same visual language already approved for the v1.10.7 Booking cards.

## Entry points

Main flow:

```text
Bookings
→ tap booking card
→ Booking Details
```

The same screen can also be used as the destination for booking notifications
and as a safe fallback when a chat notification is no longer chat-eligible.

## New Booking Details structure

```text
Booking details

Provider / Service / Status
Booking ID

Current status message

Schedule
Date + Time
Distance if backend returns it

Service address
Open Maps if allowed

Provider location
Only when backend exposes it

Contact provider
Chat + Call
Only when chatEnabled=true

Service details
Service price
Customer note
Reason where applicable

Completed review/rating

Allowed bottom actions
Book again
Cancel booking
```

## Status-specific behavior

### Pending

Shows:

- Pending badge
- Waiting for provider response
- Date/time
- Service address
- Customer note
- Cancel only when `canCancel=true`

No Chat or Call is shown before backend enables communication.

### Accepted

Shows:

- Accepted badge
- Provider accepted message
- Schedule
- Service address
- Provider location when returned
- In-app Chat
- Call UI preview
- Cancel only when backend allows it

### In Progress

Shows:

- In progress badge
- green live state
- Service is currently underway
- Chat
- Call
- no fake Cancel action

### Completed

Shows:

- Completed badge
- Service completed state
- Schedule
- Service price
- Note
- existing Customer review when present
- Rate experience card when `canRate=true`
- Book again when `canRebook=true`

### Canceled

Shows:

- Canceled badge
- Canceled state
- returned booking details
- reason only when backend provides it
- Book again only when allowed

### Rejected

Shows:

- Rejected badge
- Provider could not accept message
- Provider reason when backend supplies `reason`
- Book again when allowed

### Not Completed

Shows:

- Not completed badge
- orange status treatment
- backend reason when present
- Book again when allowed

## Circular provider identity

The provider image is:

```text
56 × 56
circle
```

The no-image fallback is also circular.

This continues the Customer-role profile/provider-image consistency rule.

## Schedule formatting

Raw backend date/time are displayed in Customer-friendly format.

Example:

```text
2026-09-29
17:21:00
```

becomes:

```text
Tue, 29 Sep, 2026
5:21 pm
```

No backend values are modified.

## Location privacy

The screen displays only location data returned by the Booking API.

It does not reconstruct hidden coordinates or private provider/customer
location.

Maps buttons render only when the corresponding backend Maps URL exists.

## Contact Provider

The communication section appears only when:

```text
chatEnabled = true
```

Buttons:

```text
In-app chat
Call
```

Call continues to open the existing Voice Call Preview. Real WebRTC/audio is
still intentionally on hold.

## Service price

The screen uses:

```text
Service price ₹...
```

It does NOT use:

```text
Paid ₹...
Amount paid
```

because the current Booking model does not contain verified payment-ledger
evidence.

## Notes and reasons

Customer note uses a neutral card.

Backend reason uses status-aware styling:

```text
Rejected       → red
Not completed  → orange
Other reason   → neutral
```

No reason is invented.

## Review

Completed + already reviewed:

```text
Your review       ★ 4.5
<real review comment>
```

Completed + `canRate=true`:

```text
How was your service?
Rate your experience
☆ ☆ ☆ ☆ ☆
```

Tap opens the existing Booking Review screen.

## Rebook behavior

The old:

```text
View provider to rebook
```

action is simplified to:

```text
Book again
```

and opens the existing Booking Request flow for the same provider.

It appears only when:

```text
canRebook=true
providerId exists
```

## Cancel behavior

Cancel appears only when:

```text
canCancel=true
```

Android confirmation is still required before the real cancellation mutation
runs.

## Removed unnecessary content

The old page subtitle:

```text
Track the request and use only the actions currently allowed by the backend.
```

is removed.

The technical payment disclaimer at the bottom is also removed from the UI.
The UI itself now uses the safe `Service price` wording.

## Loading state

The loading UI now resembles the actual Booking Details structure:

- circular provider identity
- provider/service text
- status/summary card
- schedule/location cards

## File replaced

```text
src/screens/customer/BookingDetailsScreen.tsx
```

## Dependencies

No npm command.

## Install

1. Keep v1.10.7 as the current baseline.
2. Copy/replace this ZIP content into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do not run `npm install`.
4. Run normally from Android Studio.

## Real-device QA

Test at least one booking from each available state:

```text
Pending
Accepted
In Progress
Completed
Canceled / Rejected / Not Completed
```

Check:

### Navigation
- booking card tap opens this page
- Android Back returns to Bookings

### Identity
- provider image is circular
- status badge matches Booking list card
- Booking ID is visible

### Schedule
- date/time readable
- distance appears only when returned

### Location
- service location shown only if returned
- Maps opens correctly
- provider location shown only if returned

### Communication
- Chat only when eligible
- Call only when eligible
- Call opens preview only

### Completed
- `Service price`, never `Paid`
- existing rating/review displays correctly
- Rate action opens Booking Review when allowed

### Closed states
- reason appears only when returned
- reason styling matches status

### Actions
- Cancel only when allowed
- Book again only when allowed
- no duplicate/invalid action appears

## Next Customer page

After v1.10.8 approval:

```text
Saved Providers UI Polish
```

Then:

```text
Profile
Provider Details + Booking Request
Chat + Review + remaining secondary pages
Account/security/location
Final Customer visual regression
Customer UI freeze
v2.0.0 Provider Workspace
```

## Still intentionally pending

- real Android FCM push
- real WebRTC voice calling
- Google Sign-In
- profile-photo upload until media metadata/EXIF hardening
- final Provider notification deep-links after Provider workspace exists
