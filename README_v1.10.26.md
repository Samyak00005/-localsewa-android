# Localsewa Android v1.10.26 — Customer Finalization Refinements

## Base

Apply over:

`v1.10.25 — Customer Finalization Phase 1`

This release contains Customer UI refinements plus one small Android native
module for the notification backdrop blur.

No npm package is required.

---

# 1. Request Service refinements

## Provider card

`VERIFIED` and `AVAILABLE / UNAVAILABLE` are no longer crowded into the top-right
of the provider identity.

They now appear together at the bottom of the provider card.

## Three request steps

The three cards now use numeric step markers:

- 1 — Choose service
- 2 — Service address
- 3 — Preferred schedule

The old service/map/calendar icons in the step circles are removed.

The old `1/3`, `2/3`, `3/3` labels are also removed.

Their top-right position is now used by an Expand / Collapse chevron.

## Collapsed card summaries

When a card is collapsed it keeps the important selection visible:

Choose service:
- selected service name
- or Custom service / Not selected

Service address:
- verified area
- or typed address
- or Address not added

Preferred schedule:
- selected date + time
- or Schedule not selected

This allows the Customer to review the request without keeping every form
section expanded.

## Date / time format

Customer-facing date input is now:

`DD/MM/YYYY`

Example:

`29/09/2026`

Customer-facing time input is now:

`3:45 PM`

The app converts these values back to the existing backend contract:

- `booking_date` → `YYYY-MM-DD`
- `booking_time` → `HH:mm`

The backend booking API is unchanged.

---

# 2. Account Deletion refinements

## Extra confirmation step

The deletion form is no longer immediately exposed.

The page first shows:

`Are you sure you want to delete this account?`

followed by the lighter destructive text action:

`Continue to account deletion`

Only after tapping that action does the ownership verification popup open.

## Deletion form is now a popup

The old inline `Schedule deletion` card has been moved into a modal.

New heading:

`Start account deletion`

Final destructive action:

`Start 30-day deletion period`

The real backend behavior is unchanged: deletion is scheduled with the existing
30-day recovery period.

## Information section simplified

The three large accordion/question boxes are removed.

The page now uses smaller plain text sections separated by thin dividers:

- What happens after you continue?
- Can you recover the account?
- Provider / Localsewa+ account

This reduces visual weight and large text on the deletion page.

## Pending deletion

An already-pending deletion continues to show the recovery-period state instead
of exposing the deletion form again.

---

# 3. In-App Chat refinements

## Date separators

Chat messages are now grouped by day.

A date separator appears between different chat days:

`──────── 10 October ────────`

The date is not repeated on every chat bubble.

Individual message bubbles keep their existing AM/PM time and Sent / Read state.

## Header cleanup

The Booking ID / booking code has been removed from the chat header.

Header now shows:

- provider identity
- service name
- Call action where currently allowed

---

# 4. Notification popup refinements

## Bottom-sheet placement

The Bell notification panel is no longer vertically centered.

It now behaves like a bottom sheet:

- approximately 90% of screen height
- aligned to the bottom
- 8px left margin
- 8px right margin
- 8px bottom margin

The smaller horizontal margin gives notification cards more usable width.

## Background blur

On Android 12 / API 31 and newer, the app now applies a real native blur to the
underlying Customer screen while the notification sheet is open.

A translucent dim layer is still used for contrast.

On older Android versions, the dim overlay remains as the fallback.

No third-party blur npm dependency was added.

## Customer / Provider notification identity

Each notification now has a very lightweight workspace marker:

- Customer
- Provider

The marker uses a small dot + compact label instead of a large badge.

Workspace detection uses the same existing notification-routing resolver, so
the visual identity and navigation target stay aligned.

The same subtle role marker is also added to the standalone Notifications list.

---

# Files replaced

- `src/screens/customer/BookingRequestScreen.tsx`
- `src/screens/customer/AccountDeletionScreen.tsx`
- `src/screens/customer/BookingChatScreen.tsx`
- `src/components/navigation/CustomerNotificationsModal.tsx`
- `src/components/customer/NotificationRow.tsx`
- `android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerPackage.kt`

# File added

- `android/app/src/main/java/com/localsewaapp/NotificationBackdropModule.kt`

---

# Install

1. Keep v1.10.25 as your current project.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. Because this version adds a Kotlin native module, Android Studio must rebuild
   native code:

`Build -> Clean Project`

then:

`Build -> Rebuild Project`

then normal Run.

---

# QA checklist

Request Service:
- provider badges appear below identity
- step markers show 1 / 2 / 3
- each card expands/collapses
- collapsed cards show selected summaries
- date accepts DD/MM/YYYY
- time accepts AM/PM
- request still submits using existing backend contract

Delete Account:
- initial page does not immediately show deletion form
- Continue to account deletion opens popup
- Password mode works
- Email OTP mode works
- DELETE confirmation still required
- 30-day lifecycle unchanged

Chat:
- header no longer shows booking ID
- date separator appears when day changes
- message time / Sent / Read still work

Notifications:
- sheet opens at bottom
- sheet is ~90% height
- left/right/bottom margins are compact and equal
- Android 12+ underlying screen is blurred
- Customer / Provider role marker appears
- notification deep links still open the correct workspace/page

---

# Validation

Patch TS/TSX syntax diagnostics: 0  
Merged-source missing relative imports: 0

## Next

After this version passes runtime QA:

`v1.10.27 — Customer Regression Fixes / UI Freeze`

Then the Customer workspace can be frozen and work can move to:

`v2.0.0 — Provider Workspace`
