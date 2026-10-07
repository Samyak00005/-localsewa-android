# Localsewa Android v1.8.0 — Customer Bookings & Lifecycle Foundation

## Summary

v1.8.0 replaces the Customer Bookings placeholder with real backend booking
data and introduces native booking details, cancellation, and review flows.

It also corrects the service-catalog assumption from v1.7.0: a verified public
`GET /api/categories` route exists, so Home and Services now use the active
backend category catalog instead of deriving categories only from provider rows.

## Version

`v1.8.0`

## What is connected

### Active service categories

```text
GET /api/categories
```

Expected response:

```text
{ success, categories: [{ id, slug, name }] }
```

Home uses the first active categories for service chips.

Services displays the full active category response.

Provider availability remains independent: a valid active category can exist
without an active provider.

### Customer bookings

```text
GET /api/bookings?scope=customer
Authorization: Bearer <token>
```

The UI maps the actual backend booking payload fields, including:

- `booking_code`
- `provider_id`
- `helper`
- `service`
- `providerServiceId`
- `servicePrice`
- location/area
- booking date/time
- status
- reason
- rating
- `canRate`
- `canRebook`
- `chatEnabled`
- `canCancel`
- provider/customer location unlock fields

## Booking status model

The native UI supports the backend statuses:

```text
PENDING
ACCEPTED
IN_PROGRESS
COMPLETED
REJECTED
CANCELLED
NOT_COMPLETED
```

### Customer action rule

The Android app does not recreate business rules from status names where the
server already returns action flags.

It uses:

```text
canCancel
canRate
canRebook
chatEnabled
```

as the authoritative UI action flags.

## Customer booking tabs

Bookings page now includes:

```text
Active
All
Cancelled
Completed
```

Active includes:

```text
pending
accepted
in_progress
```

Rejected and not-completed bookings remain visible under All.

## Booking Details

New screen:

`BookingDetailsScreen`

Shows:

- service
- provider
- booking code
- status
- date/time
- service location when returned
- Maps handoff when `mapsUrl` exists
- provider location only when backend unlocks it
- distance label when returned
- service price
- customer note
- rejection/non-completion reason
- chat eligibility
- cancellation action
- review action
- rebook/provider-navigation action

## Cancellation

Real endpoint:

```text
PATCH /api/bookings/{id}/status
```

Customer cancellation sends:

```json
{
  "status": "CANCELLED"
}
```

The Cancel action is rendered only when the server returns:

```text
canCancel = true
```

A native Android confirmation dialog is shown before the mutation.

After success, booking queries are invalidated and refreshed.

## Reviews

Real endpoint:

```text
POST /api/bookings/{id}/review
```

Payload:

```json
{
  "rating": 1-5,
  "comment": "optional"
}
```

Review UI appears only when:

```text
canRate = true
```

After submission, booking and provider caches are invalidated.

## Important payment wording

The backend field:

```text
servicePrice
```

is displayed as:

`Service price`

It is NOT labelled `Amount paid`.

The reviewed booking handlers do not provide an independently verified customer
payment ledger, refund record, or payment receipt. A COMPLETED booking therefore
must not be displayed as proof of payment.

## Chat

`chatEnabled` is now surfaced in Booking Details.

The actual native Chat screen is intentionally not connected in v1.8.0.

This keeps the booking lifecycle work independently testable before introducing
message polling/sending.

## Booking creation

The backend does support:

```text
POST /api/bookings
```

with provider/service, schedule, signed location proof and an idempotent-style
`request_id`.

However, creation is intentionally scheduled for v1.8.1 because a correct
native request form must first wire the full location-proof flow:

```text
/location/search
/location/place
/location/reverse
/location/validate
```

and preserve the returned:

```text
latitude
longitude
area_label
verification_token
```

We will not submit guessed or unverified location data.

## Files added

```text
src/types/category.ts
src/types/booking.ts

src/api/categoryApi.ts
src/api/bookingApi.ts

src/components/customer/BookingCard.tsx
src/components/customer/BookingStatusBadge.tsx

src/screens/customer/BookingDetailsScreen.tsx
src/screens/customer/BookingReviewScreen.tsx
```

## Files replaced

```text
src/hooks/useCustomerData.ts
src/components/customer/index.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/screens/customer/CustomerHomeScreen.tsx
src/screens/customer/CustomerServicesScreen.tsx
src/screens/customer/CustomerBookingsScreen.tsx
src/screens/customer/index.ts
```

## Dependencies

No new npm package is required.

Keep the dependencies already installed through v1.7.0, including:

```text
@tanstack/react-query
react-native-keychain
React Navigation
```

## Install

1. Stop the running app.
2. Copy the v1.8.0 ZIP contents into the project root.
3. Replace matching files.
4. No new `npm install` command is required.
5. Run the app from Android Studio.

If Metro is already running, a normal reload may be enough.

## QA checklist

### Categories

1. Home should show backend categories, not only the four categories with current providers.
2. Services should report the active category count from `/api/categories`.
3. Tap a category and confirm matching providers filter.
4. A category with no provider should show a correct empty-provider state.

### Bookings

1. Open Bookings.
2. Confirm placeholder card is gone.
3. Confirm real account bookings load.
4. Check Active/All/Cancelled/Completed counts.
5. Open a booking.
6. Verify service/provider/code/date/time/status.
7. Check location visibility changes according to backend payload.
8. Check service price wording.
9. Check reason on rejected/not-completed booking.
10. Check provider location only if backend returned it.

### Cancel

Use a test PENDING/ACCEPTED booking only.

1. Open Booking Details.
2. Confirm Cancel button appears only when backend says `canCancel`.
3. Cancel.
4. Confirm native confirmation appears.
5. Confirm status refreshes to CANCELLED.
6. Confirm booking moves out of Active.

### Review

Use a completed test booking that has not been rated.

1. Confirm Rate action appears.
2. Submit 1–5 stars.
3. Optional comment.
4. Confirm review saves.
5. Confirm Rate action disappears after refresh.

## Known limitations

- Booking creation/request form is not connected yet.
- Location proof/search UI is not connected yet.
- Booking chat UI is not connected yet.
- Voice calling is not connected yet.
- Notifications are not connected yet.
- Rebooking currently returns to Provider Details; it does not prefill a request.
- No customer payment receipt/ledger exists in this inspected booking contract.
- Profile page still contains the earlier placeholder section above the real
  account card.
- Navigation icons are still temporary letters/glyphs.
- Google Sign-In remains on hold.

## Next — what we will do next

### v1.8.1 — Booking Request + Location Foundation

Next build will make the Provider Details booking CTA real.

Planned flow:

```text
Provider Details
    ↓
Choose provider service
    ↓
Choose date/time
    ↓
Choose/verify service address
    ↓
Backend location proof
    ↓
Review request
    ↓
POST /bookings
    ↓
Pending booking
    ↓
Booking Details
```

The native client will preserve one `request_id` for the same submission retry,
so an ambiguous network retry does not intentionally create a second logical
request.

### v1.8.2 — Booking Chat

After request creation works:

- booking-scoped message history
- text sending
- read state
- chat only for backend-eligible booking states
- booking/provider identity in chat header

### After booking module

Then we will complete the remaining Customer shell:

```text
Profile / Account Settings
Notifications
Help & Support
Terms
Privacy
Account deletion/security
```

After Customer UI is stable we move to the real Provider workspace.
