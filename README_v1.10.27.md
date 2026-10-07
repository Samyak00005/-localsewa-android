# Localsewa Android v1.10.27 — Deletion & Notifications Refinement

## Base

Apply over:

`v1.10.26 — Customer Finalization Refinements`

No npm dependency and no new Android/native module is added in this patch.

---

# Account Deletion

## Deletion popup/card improved

The verification popup now has a cleaner hierarchy:

- circular destructive icon
- `Confirm account deletion`
- smaller supporting copy
- compact close button
- Password / Email OTP verification
- DELETE confirmation
- lightweight session warning
- final destructive CTA

The card radius and spacing are slightly refined as well.

## CTA wording

Old:

`Start 30-day deletion period`

New:

`Begin deletion process`

This is shorter while the supporting copy still clearly states that the
30-day recovery period starts after confirmation.

## Session warning

Old warning was a large yellow Alert box:

`Starting deletion signs this account out from active sessions.`

That boxed warning is removed.

It is now a lightweight inline safety note with a sign-out icon:

`You’ll be signed out from every active Localsewa session after confirmation.`

This keeps the form cleaner while preserving the important security warning.

## Question-section dividers

Yes — the three information sections on the Delete Account page already had
thin dividers between them.

They remain intentionally as:

`StyleSheet.hairlineWidth`

So the sections stay visually separated without returning to large question
cards.

---

# Notifications

## Customer / Provider chips removed

The explicit:

- `Customer`
- `Provider`

chips are removed from both:

- Bell notification bottom sheet
- standalone Notifications list

## Role identity now comes from the notification background

Customer notification:

- very light Customer green surface
- Customer-green border/accent when unread

Provider notification:

- slightly deeper/more neutral Provider forest-green tint
- Provider-forest border/accent when unread

Current surfaces:

Customer:

`#F2FBF6`

Provider:

`#EDF3F0`

The difference is intentionally subtle so the list does not become visually
heavy.

Unread notifications still retain the small unread dot and slightly stronger
border.

## Routing behavior is unchanged

The background role is calculated using the same existing
`resolveNotificationTarget()` function used for navigation.

Therefore:

- Customer-tinted notification -> Customer workspace target
- Provider-tinted notification -> Provider workspace target

No separate duplicate role-detection logic was added.

---

# Files replaced

- `src/screens/customer/AccountDeletionScreen.tsx`
- `src/components/navigation/CustomerNotificationsModal.tsx`
- `src/components/customer/NotificationRow.tsx`

---

# Install

1. Keep v1.10.26 as the current baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No native Clean/Rebuild is required for this patch because these changes are
   TypeScript-only.
5. Normal Android Studio Run is enough.

---

# QA

## Delete Account

Confirm:

- popup has cleaner header/icon hierarchy
- Password mode still works
- Email OTP mode still works
- DELETE text confirmation still works
- yellow boxed session warning is gone
- inline sign-out note is visible
- CTA says `Begin deletion process`
- three page information sections still have subtle dividing lines
- 30-day backend lifecycle is unchanged

## Notifications

Confirm:

- Customer / Provider chips are gone
- Customer notifications use a very light green surface
- Provider notifications use the slightly deeper forest-green tint
- role can be understood without large badges
- unread dot remains
- Customer notification deep links still work
- Provider notification still switches/targets Provider workspace correctly
- Bell bottom-sheet blur and positioning from v1.10.26 remain unchanged

---

# Validation

TS/TSX syntax diagnostics for all three changed files: 0

## Next

After this visual QA:

`v1.10.28 — Customer Regression Fixes / UI Freeze`
