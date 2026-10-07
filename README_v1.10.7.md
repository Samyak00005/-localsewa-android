# Localsewa Android v1.10.7 — Customer Bookings UI Polish

## Base

Apply this build over:

```text
v1.10.6 — All Services UI Polish
```

No new npm dependency is required.

## Scope

This release redesigns the Customer **Bookings list and Booking cards** using
the approved reference-card direction.

It does NOT change the backend booking lifecycle.

Booking Details keeps its current functionality for now and will be visually
polished after this list/card QA passes.

---

## 1. Booking filters are now locked to this order

```text
All
Active
Canceled
Completed
```

Default selected filter:

```text
All
```

### Mapping

```text
All
  → every booking

Active
  → pending
  → accepted
  → in_progress

Canceled
  → cancelled
  → rejected
  → not_completed

Completed
  → completed
```

`Canceled` is intentionally a Customer-facing group. The backend status remains
`cancelled`.

---

## 2. Compact booking filter bar

The previous large count cards are removed.

New filter design:

```text
All 8 | Active 2 | Canceled 3 | Completed 3
```

- selected item uses Customer green
- count remains visible
- all four options fit in one compact segmented surface
- no horizontal scrolling is required on normal phone widths

---

## 3. Booking cards follow the approved reference designs

There are still 7 real backend statuses, but the UI uses the same shared card
language with status-specific content/actions.

### Pending

Shows:

- circular provider image or circular Calendar fallback
- provider name
- service name
- Custom service request label where applicable
- Booking ID
- date
- time
- service address
- Open your service address where Maps URL exists
- Waiting for provider response notice
- Cancel booking when backend `canCancel=true`

Does NOT show Chat or Call before backend enables communication.

### Accepted

Shows:

- identity
- Accepted badge
- booking schedule
- service address
- Open your service address
- provider base/location when backend exposes it
- In-app chat
- Call
- Cancel booking only if backend `canCancel=true`

Call still opens the existing **voice-call UI preview** only.

### In Progress

Shows:

- In progress badge
- schedule/location
- active `Service is currently underway` state
- In-app chat
- Call

Cancel is not invented if backend does not permit it.

### Canceled

Shows:

- Canceled badge
- date/time
- location or backend-hidden-location message
- Customer note when present
- cancellation reason only when backend supplies it
- Book again only when `canRebook=true`

The app does not claim `Canceled by you` because the current Booking model does
not expose a reliable cancellation actor.

### Rejected

Shows:

- Rejected badge
- note
- Provider reason when backend supplies `reason`
- Book again when allowed

### Not Completed

Shows:

- Not completed badge
- note
- backend reason in the orange status box
- Book again when allowed

### Completed — not rated

Shows:

- Completed badge
- date/time
- **Service price** when backend supplies `servicePrice`
- note
- How was your service?
- five visual rating stars
- tapping the rating prompt opens the existing Booking Review screen
- Book again when allowed

### Completed — already rated

Shows:

```text
Your review                     ★ 4.5
<review comment>
```

plus Book again when allowed.

---

## 4. Payment wording remains backend-safe

The reference screenshots use wording such as:

```text
Paid ₹5,000
```

The current Customer Booking contract does **not** provide verified payment
ledger / amount-paid proof.

Therefore v1.10.7 uses:

```text
Service price ₹5,000
```

and never claims a booking was paid merely because it is completed.

---

## 5. Provider/profile images remain circular

Booking cards now consistently use:

```text
50 × 50 circular provider image
```

If there is no provider image, the fallback is also a circle containing the
Calendar icon.

No square identity image is used in Booking cards.

---

## 6. Schedule formatting improved

Raw backend values are presented in a Customer-friendly form.

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

Formatting is done locally without changing backend values.

---

## 7. Location behavior

For active bookings:

- address is shown only from returned backend Booking data
- Maps button appears only when `mapsUrl` exists
- provider location appears only when backend returns it

For closed/completed bookings:

- returned location is shown if still exposed
- otherwise a neutral hidden-location message is shown

No private location is reconstructed or invented.

---

## 8. Card actions are driven by backend flags

The UI respects:

```text
canCancel
chatEnabled
canRate
canRebook
```

instead of enabling actions solely from a client-side status guess.

Examples:

```text
Chat       → only when chatEnabled
Call       → same communication eligibility, UI preview only
Cancel     → only when canCancel
Rate       → only when canRate
Book again → only when canRebook
```

---

## 9. Direct card actions

### Chat

Opens:

```text
BookingChat
```

### Call

Opens:

```text
VoiceCallPreview
```

Real WebRTC/audio remains intentionally on hold.

### Cancel

Shows Android confirmation first:

```text
Cancel booking?
Keep booking / Cancel booking
```

Then uses the existing real cancellation mutation.

### Book again

Opens a new Booking Request for the same provider when a valid provider ID is
available.

### Rating

Opens the existing Booking Review screen.

### Card body

Tapping the main card information area opens Booking Details.

---

## 10. Empty states

Each filter now has relevant empty-state copy.

Examples:

```text
All
You haven't booked a service yet

Active
No active bookings

Canceled
No canceled bookings

Completed
No completed services yet
```

Every empty state includes:

```text
Browse services
```

which opens All services.

---

## 11. Loading state

The old generic skeleton is replaced by a Booking-card-shaped skeleton:

- circular identity
- provider/service text
- divider
- schedule row
- action area

This reduces visual layout shift while booking data loads.

---

## 12. Latest bookings first

Within each filter, bookings are presented newest-first using the returned
booking date/time.

No backend record is mutated.

---

## Status badge palette

```text
Pending        → amber
Accepted       → blue
In progress    → operational green
Completed      → success green
Canceled       → neutral gray
Rejected       → red
Not completed  → orange
```

Badge labels use Customer-facing title case instead of large uppercase text.

---

## Files replaced

```text
src/components/icons/AppIcon.tsx
src/components/customer/BookingStatusBadge.tsx
src/components/customer/BookingCard.tsx
src/screens/customer/CustomerBookingsScreen.tsx
```

## Dependencies

No npm command is required.

Continue using the dependencies already installed by previous versions.

---

## Install

1. Keep v1.10.6 as the current baseline.
2. Copy/replace the contents of this ZIP into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do NOT run `npm install`.
4. Run normally from Android Studio.

---

## Real-device QA

### Filters

Confirm exact order:

```text
All
Active
Canceled
Completed
```

Check counts against the bookings shown.

Specifically verify:

```text
Canceled count =
cancelled + rejected + not_completed
```

### Pending card

- Pending badge
- no Chat
- no Call
- Cancel only when allowed
- service location behaves correctly

### Accepted card

- Chat
- Call
- Cancel where allowed
- service address button
- provider base/location if available

### In Progress card

- In progress badge
- underway state
- Chat
- Call
- no incorrect cancellation action

### Canceled / Rejected / Not Completed

- correct badge colors
- correct reason presentation
- no fake cancellation actor
- Book again only if allowed

### Completed

For an unrated booking:

- rating prompt visible
- tapping rating prompt opens Review
- Service price wording, NOT Paid

For a rated booking:

- Your review box
- real rating
- real comment where available

### Circular image consistency

Check cards with:

- real provider image
- no provider image

Both identity shapes should remain circular.

### Navigation

- tap main card → Booking Details
- Chat → Booking Chat
- Call → call preview only
- Book again → Booking Request
- Browse services → All services

---

## Next step after this QA

If the Booking-card system is visually approved:

### v1.10.8 — Booking Details UI Polish

Bring Booking Details into the same approved card language:

```text
Booking identity/status
Schedule
Service address
Provider communication
Notes/reasons
Service price
Allowed actions
```

Then continue with:

```text
Saved UI Polish
Profile + secondary pages
Final Customer visual regression
Customer UI freeze
v2.0.0 Provider Workspace
```

## Still intentionally pending

- real Android FCM push
- real WebRTC voice calling
- native Google Sign-In
- profile-photo upload until EXIF/media privacy hardening
- final Provider notification deep links after Provider workspace exists
