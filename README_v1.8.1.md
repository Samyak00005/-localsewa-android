# Localsewa Android v1.8.1 — Booking Request & Verified Location

## Summary

v1.8.1 turns the Provider Details booking CTA into a real Customer booking
request flow.

The implementation follows the inspected Hostinger backend contract rather than
the old Android placeholder UI.

Google Sign-In remains on hold.

## Version

`v1.8.1`

## Main flow

```text
Provider Details
    ↓
Request service
    ↓
Choose provider service / custom request
    ↓
Verify service address
    ↓
Choose future date/time
    ↓
Review request
    ↓
POST /api/bookings
    ↓
Pending booking
    ↓
Booking Details / Bookings
```

## Location strategy in this version

v1.8.1 deliberately starts with **server-verified typed address**.

It does NOT fabricate latitude/longitude.

It does NOT use a hardcoded city or emulator coordinate.

The backend exposes:

```text
GET /api/location/validate
```

and verified location results include coordinates plus a signed verification
token.

The Android app requires that proof before sending a booking.

### Why Current Location is not added yet

Native GPS needs Android runtime permission, device/emulator location handling,
reverse geocoding and lifecycle/error states.

Rather than mixing all of that into the first booking-write milestone, v1.8.1
ships a fully auditable typed-address verification path first.

Current-location GPS will be added as a later native location enhancement.

## Booking request body

The Android app submits the backend-defined fields:

```text
provider_id

provider_service_id
OR
is_custom_service + custom_service_name

address
booking_date
booking_time
note

latitude
longitude
area_label
location_source = NEW
verification_token

request_id
```

The server remains authoritative for published service pricing.

## Request-id protection

The inspected backend accepts a booking `request_id` containing 16–64:

```text
letters
numbers
_
-
```

v1.8.1 generates one request ID for a specific form payload.

Important behavior:

- first submission generates the ID
- a timeout/error does NOT automatically discard it
- retrying the unchanged form reuses the same ID
- changing service/address/date/time/note clears it and creates a new ID on the
  next submission
- successful creation clears it

This is designed for the booking-request-key protection in the backend.

POST requests are never automatically retried by the generic API client.

## Schedule validation

Input contract:

```text
Date: YYYY-MM-DD
Time: HH:mm
```

The app rejects malformed values and requires a future timestamp.

The booking comparison uses India offset (`+05:30`) because the PHP application
uses Asia/Kolkata.

The backend still performs final validation.

## Provider service rules

Booking Request supports:

1. provider-published service
2. custom service request

Published service IDs are sent as `provider_service_id`.

Custom requests send:

```text
is_custom_service: true
custom_service_name
```

## Provider Details change

The previous disabled:

```text
Booking coming next
```

CTA is replaced with:

```text
Request service
```

when the provider is available.

Unavailable providers cannot submit a new request from the Android UI.

## Navigation policy correction

Page-level custom “Back” buttons are removed from:

- Provider Details
- Booking Details
- Booking Review
- Booking Request

Use the normal Android/system/navigation back behavior instead.

This keeps the mobile interaction model consistent.

## Files added

```text
src/types/location.ts
src/api/locationApi.ts
src/screens/customer/BookingRequestScreen.tsx
```

## Files replaced

```text
src/api/bookingApi.ts
src/hooks/useCustomerData.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/screens/customer/ProviderDetailsScreen.tsx
src/screens/customer/BookingDetailsScreen.tsx
src/screens/customer/BookingReviewScreen.tsx
src/screens/customer/index.ts
```

## Dependencies

No new npm package is required.

Keep existing dependencies from v1.8.0.

## Install

1. Stop/reload the running app.
2. Copy this ZIP into the existing Localsewa project.
3. Replace matching files.
4. No `npm install` command is required.
5. Run from Android Studio.

## QA — do this with test data

Booking creation writes real production data.

Use a test Customer account and a provider/service you are comfortable creating
a test request against.

### Provider Details

1. Open a real provider.
2. Confirm `Request service` appears when provider is available.
3. Confirm unavailable provider CTA is disabled.
4. Android system Back should still return normally.

### Service selection

1. Open Request service.
2. Choose a provider service.
3. Try custom service.
4. Custom service under 3 characters should be blocked.

### Address verification

1. Enter a complete Maharashtra/India address.
2. Tap Verify address.
3. Confirm verified area message.
4. Edit the address.
5. Confirm previous verification is discarded.
6. Re-verify.

If server-side geocoding is temporarily unavailable, the booking must NOT submit
with guessed coordinates.

### Schedule

1. Invalid date → blocked.
2. Invalid time → blocked.
3. Past schedule → blocked.
4. Future valid schedule → allowed.

### Real booking submission

1. Choose real provider service.
2. Verify address.
3. Enter future schedule.
4. Send request.
5. Confirm new booking appears as PENDING.
6. Confirm Booking Details uses actual server values.
7. Confirm service price comes from backend.

### Retry behavior

For normal QA, do not intentionally create repeated real bookings.

If a network failure happens naturally, leave the form unchanged and press Send
again; the same request ID is retained.

## Known limitations

- Typed-address validation is implemented; native GPS/current-location is not
  yet added.
- Search/autocomplete (`/location/search` + `/location/place`) is not yet
  presented as a suggestion dropdown.
- Date/time use strict text fields; native date/time pickers can replace them
  in a later UI refinement.
- Chat is not connected yet.
- Voice calls are not connected yet.
- Notifications are not connected yet.
- Profile/default saved-address UI is not integrated into booking yet.
- Google Sign-In remains on hold.
- Navigation icons remain temporary.

## Next milestone

### v1.8.2 — Booking Chat

The backend already exposes booking-scoped chat for eligible booking states.

Next we will implement:

```text
Accepted / In Progress booking
        ↓
Open Chat
        ↓
Message history
        ↓
Send text
        ↓
Read state
        ↓
Booking/provider identity
```

Chat must be shown only when the backend returns:

```text
chatEnabled = true
```

After chat is stable, the next Customer work will be:

```text
Notifications
Profile + Account Settings
Help & Support
Terms & Conditions
Privacy Policy
Account Security / Deletion
```

Then we move into the real Provider workspace.

## Backend grounding

The reviewed Hostinger backend confirms that booking creation requires:

- public provider reference
- provider service or custom service
- date/time
- address
- coordinates/area
- location source
- signed verification token
- optional request ID for safe native retry behavior

It also confirms that the initial created booking status is PENDING.
