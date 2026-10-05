# Localsewa Android v1.10.11 — Inline Review Hotfix

Base: v1.10.10 Bookings UI Refinement.
No new npm dependency.

## Changes

1. Completed Booking cards no longer show:
   `Location hidden after completion`

2. Completed Booking Details no longer show:
   - `Service completed`
   - empty `Service address / Location is hidden for this booking state`

   A real location section can still render if backend actually returns one.

3. The separate `BookingReview` page/route is removed from:
   - `CustomerStackParamList`
   - `CustomerNavigator`
   - Customer screen exports
   - Booking list navigation
   - Booking Details navigation

4. Rating is now inline.

Unrated completed booking:

```text
How was your service?
Rate your experience
☆ ☆ ☆ ☆ ☆
```

Tap a star and the SAME card expands:

```text
★ ★ ★ ☆ ☆

[ Share a short review (optional) ]

[ Save review ]
```

No separate page opens.

5. Inline review still uses the real existing backend review mutation:
   `POST /api/bookings/{id}/review`

6. After review submission, the card switches to the existing reviewed state:
   `Your review  ★ rating`
   plus the real comment when present.

7. Booking Details also uses the same shared inline review at the bottom.

## New shared component

`src/components/customer/InlineBookingReview.tsx`

## Files replaced

- `src/components/customer/BookingCard.tsx`
- `src/components/customer/index.ts`
- `src/screens/customer/CustomerBookingsScreen.tsx`
- `src/screens/customer/BookingDetailsScreen.tsx`
- `src/screens/customer/index.ts`
- `src/navigation/types.ts`
- `src/navigation/CustomerNavigator.tsx`

## One obsolete file to delete

After copying this patch, delete in Android Studio Project view:

`src/screens/customer/BookingReviewScreen.tsx`

Right-click -> Delete -> OK.

The app no longer imports or routes to this file, but deleting it physically finishes the cleanup.

## QA

Completed card:
- hidden-location line gone
- tap star stays on same card
- review textarea appears inline
- Save review submits
- reviewed state replaces form
- Book again still works

Booking Details:
- no extra `Service completed` panel
- no empty hidden Service Address card
- inline rating remains at page bottom
- no Rate Your Service page opens

## Next

Saved Providers UI Polish.
