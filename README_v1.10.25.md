# Localsewa Android v1.10.25 — Customer Finalization Phase 1

## Base

Apply over the current working Customer baseline:

```text
v1.10.24 — Provider Details UI Polish
```

This build is TypeScript/React Native only.

- No npm install
- No Kotlin/Java change
- No Gradle change
- No Android permission change

## Scope

This release completes the remaining Customer-side UI consistency work for:

1. Booking Request
2. Account Deletion
3. In-App Booking Chat
4. Standalone Notifications

Profile photo, inline Profile editing and Default Location are intentionally not
rewritten again because those flows are already working in the current baseline.

---

## 1. Booking Request UI Polish

The Booking Request screen now uses the normal Customer shell:

- green Customer header
- Bell notification popup
- Hamburger sidebar
- Customer bottom navigation
- All services active

### Provider summary

The top card now shows:

- circular provider image/avatar
- provider name
- verified badge
- category
- coarse provider location
- availability

### Service selection

Listed provider services now use clearer radio-style selectable cards.

Each real service can show:

- service name
- description
- real provider price

Custom service remains available through:

```text
Something else
```

No fake catalog data is added.

### Service address

If the Customer already has a saved default location, its address is prefilled.

It is **not treated as booking-verified automatically**.

The Customer still has to use:

```text
Verify address
```

before submitting the booking. The existing server location validation/proof
remains the source of truth.

### Schedule

Date and time are shown side-by-side to reduce vertical clutter.

Existing backend-safe validation remains:

```text
Date: YYYY-MM-DD
Time: HH:mm
Future schedule only
```

No provider working-hours engine is invented because the current backend does
not expose one.

### Request review

A final Review Request card shows:

- Provider
- Service
- Verified address
- Schedule

before the Customer sends the booking request.

### Duplicate-request protection

The existing `request_id` retry behavior is preserved.

If the network result is uncertain, retrying the unchanged form keeps the same
request ID instead of generating a duplicate booking.

### Chat rule

The page explicitly states that In-App Chat becomes available only after the
Provider accepts the request.

No WhatsApp/public contact shortcut is added.

---

## 2. Account Deletion UI Consistency

Account Deletion now uses:

- green Customer header
- Bell
- Hamburger
- Customer bottom navigation
- Profile active

### Status

The current deletion state is shown in a cleaner status card.

For a pending request the page shows:

- recovery period status
- scheduled date when available
- remaining days

### Explanations

The existing accordion content is rewritten in clearer Customer language:

- What happens after scheduling?
- Can a pending deletion be recovered?
- Provider / Localsewa+ accounts

### Verification

The existing real verification choices remain:

- Account password
- Verified email OTP

The Customer must still type:

```text
DELETE
```

before the destructive action can be submitted.

The backend account-deletion lifecycle is unchanged.

---

## 3. In-App Chat Consistency

Booking Chat now uses the Customer green header.

The normal bottom navigation is shown with Bookings active while the keyboard
is closed.

When the Android keyboard opens, the bottom navigation hides automatically so
it does not consume chat/composer space.

### Chat identity header

The booking conversation header keeps:

- circular provider image/avatar
- provider name
- service name
- booking code
- call-preview icon when chat/call is allowed

### Message bubbles

Message bubbles are refined:

- Customer messages remain Localsewa green
- Provider messages use white bordered surfaces
- directional lower-corner shape
- 12-hour message time
- Sent / Read state for Customer messages

### Composer

The composer remains:

- multiline
- 1000-character limit
- circular Send action
- disabled while send state is uncertain

The existing ambiguous-network protection is preserved. The app asks the
Customer to refresh history before sending the same uncertain message again.

### Closed chat state

If the booking no longer allows chat, the Customer gets a clean state card with:

```text
Open booking details
```

instead of a dead chat screen.

---

## 4. Notifications Consistency

The standalone Notifications route now also uses:

- green Customer header
- Customer bottom navigation
- Home active

The Bell popup remains the primary quick-notification experience.

### Notification list

The full Notifications page now has:

- unread-count pill
- Mark all read
- improved loading skeletons
- clean empty state
- softer unread notification styling
- friendly notification date/time formatting

Existing Customer deep links remain:

- Booking notification -> Booking Details / Bookings
- Chat notification -> Booking Chat when chat is still enabled
- closed/non-chat booking notification -> Booking Details

Provider-targeted notifications still switch to Provider workspace when the
account has Provider access. Exact Provider destination routing remains part of
Provider workspace finalization because the Provider stack is the next major
phase.

The developer-facing Android-push explanatory card has been removed from the
Customer-facing Notifications page.

---

## Files replaced

```text
src/screens/customer/BookingRequestScreen.tsx
src/screens/customer/AccountDeletionScreen.tsx
src/screens/customer/BookingChatScreen.tsx
src/screens/customer/CustomerNotificationsScreen.tsx

src/components/customer/ChatMessageBubble.tsx
src/components/customer/NotificationRow.tsx
```

## Static validation performed

The patch was merged over the current Customer source snapshot and checked for:

```text
TypeScript / TSX syntax errors: 0
Missing relative imports: 0
```

## Install

1. Keep v1.10.24 as the current baseline.
2. Copy/replace this ZIP into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. No npm install.
4. No Android Clean/Rebuild is required for this TypeScript-only patch.
5. Run normally from Android Studio.

---

# Customer Final Regression QA

## Discovery -> Provider -> Booking

Test:

```text
Home
-> All services
-> Provider Details
-> Request service
-> Select service
-> Verify address
-> Date/time
-> Send request
-> Booking Details
```

Confirm:

- correct provider opens
- correct provider service IDs/prices are shown
- saved location is only prefilled, not falsely verified
- verified location is required
- invalid/past schedule is rejected
- booking is created once
- resulting booking opens correctly

## Booking lifecycle

Test real states when available:

```text
Pending
Accepted
In Progress
Completed
Canceled
Rejected
Not Completed
```

Confirm correct card/details actions remain available.

## Chat

With an Accepted/In Progress booking:

- open In-App Chat
- send message
- keyboard layout
- long message
- background/foreground
- refresh
- Sent/Read state
- ambiguous network retry protection
- call-preview icon

## Review

Complete a booking and confirm:

- inline stars
- optional written review
- Save review
- reviewed Completed card
- no old standalone review page opens

## Saved Providers

Confirm:

- save from discovery
- Saved list updates
- top-right bookmark unsaves
- Home/discovery saved state stays synchronized

## Profile

Confirm:

- inline name editing
- Email locked
- Mobile locked
- WhatsApp absent
- circular profile photo
- Android system photo picker
- uploaded image refreshes
- Default Location popup
- Account Security popup flows
- Delete Account opens this polished page
- Log out

## Notifications

Confirm:

- Bell popup
- unread count
- mark read
- mark all read
- booking deep link
- chat deep link
- closed chat redirects to Booking Details

---

## After this build

The remaining Customer work is primarily **runtime regression approval**, not a
new Customer feature page.

Once the above QA passes, the next release should be:

```text
v1.10.26 — Customer UI Freeze / Regression Fixes
```

That build should contain only bugs found during final testing.

Platform integrations intentionally remain separate and do not block Customer
UI freeze:

- native Google Sign-In
- Android FCM push notifications
- real WebRTC voice calling

After Customer freeze, move to:

```text
v2.0.0 — Provider Workspace Foundation
```
