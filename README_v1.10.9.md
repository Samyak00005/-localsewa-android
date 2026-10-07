# Localsewa Android v1.10.9 — Booking Details Shell + Rating Hotfix

## Base

Apply this build over:

```text
v1.10.8 — Booking Details UI Polish
```

No new npm package is required.

## Fix 1 — Customer header restored on Booking Details

The Booking Details screen is a Customer stack screen outside the main
BottomTab navigator, so it did not automatically inherit the normal Customer
header.

v1.10.9 explicitly renders the same shared:

```text
CustomerHeader
```

used by the five primary Customer tabs.

Result:

- same Localsewa logo
- same green Customer header
- same Bell notification popup
- same Hamburger sidebar
- same status-bar handling

Booking Details no longer looks like a separate app surface.

## Fix 2 — Bottom Customer navbar restored

Because Booking Details lives in the Customer stack above `CustomerTabs`, the
native tab bar is not mounted on that route.

v1.10.9 adds a matching secondary-shell bottom bar:

```text
Home
All services
Bookings
Saved
Profile
```

On Booking Details:

```text
Bookings
```

is shown as the active destination.

Tapping another item returns to that primary Customer tab.

This preserves the existing navigation architecture and avoids a risky route
migration just for the visual shell.

## Fix 3 — Rating/review moved to the bottom

For a completed booking, the rating/review section now appears at the bottom of
Booking Details, after the main booking actions.

### Completed + not rated

When backend returns:

```text
canRate = true
```

the bottom section shows:

```text
How was your service?
Rate your experience
☆ ☆ ☆ ☆ ☆
```

Tap opens the existing Booking Review screen.

### Completed + already rated

The bottom section shows:

```text
Your review
★ <rating>
<review comment>
```

using the real backend rating/review.

### Important rule

Rating is NOT shown for:

```text
Pending
Accepted
In Progress
Canceled
Rejected
Not Completed
```

because the current backend only allows customer rating for an eligible
Completed booking.

No fake rating action is added to closed unsuccessful bookings.

## New file

```text
src/components/navigation/CustomerDetailBottomBar.tsx
```

## Files replaced

```text
src/components/navigation/index.ts
src/screens/customer/BookingDetailsScreen.tsx
```

## Install

1. Keep v1.10.8 as the current baseline.
2. Copy/replace this ZIP content into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do NOT run `npm install`.
4. Run normally from Android Studio.

## Real-device QA

Open:

```text
Bookings
→ tap any booking card
→ Booking Details
```

Confirm:

- green Customer header is visible
- logo is visible
- Bell works
- Hamburger sidebar works
- bottom navbar is visible
- `Bookings` is the active bottom item
- Home opens Home
- All services opens All services
- Saved opens Saved
- Profile opens Profile
- Android Back still returns correctly

For a Completed booking:

- scroll to page bottom
- unrated eligible booking shows rating CTA
- rated booking shows existing review
- rating does not appear on canceled/rejected/not-completed bookings

## Next page

After this hotfix passes:

```text
Saved Providers UI Polish
```
