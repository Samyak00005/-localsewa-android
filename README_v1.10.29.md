# Localsewa Android v1.10.29 — App Settings & Workspace Transition

## Base

Apply over:

`v1.10.28 — Home, Nearby & Location Refinement`

No npm package is added.

No Android/Kotlin source is changed in this patch.

---

## 1. Customer Profile — App settings

A new `APP SETTINGS` section is added to Customer Profile.

It contains:

- App language
- App theme
- Notifications

### App language

Current value:

`English`

Tapping it confirms the current app language.

No fake multilingual translation is introduced. The current Customer source is
still English-only.

### App theme

Current value:

`Light`

Tapping it confirms the current appearance.

No fake dark theme is introduced because the current Localsewa design tokens
are still light-role themes.

### Notifications

Opens the existing real Customer Notifications screen.

---

## 2. Workspace switching transition

Customer → Provider and Provider → Customer now show a dedicated transition
popup BEFORE the workspace actually changes.

Customer mode:

- Customer icon highlighted
- Provider icon muted
- `SWITCHING WORKSPACE`
- `Customer mode`
- `Preparing your customer workspace…`

Provider mode:

- Customer icon muted
- Provider icon highlighted
- `SWITCHING WORKSPACE`
- `Provider mode`
- `Preparing your business workspace…`

The popup remains visible briefly, then the real AppShell workspace is changed.

This is implemented at AppShell level rather than inside only one screen, so
the same transition behavior is reused whenever the existing
`enterCustomer()` / `enterProvider()` workflow is called.

Provider permission rules are unchanged.

The existing optional Android backdrop blur module is reused when available.
If native blur is unavailable, the translucent overlay still works.

---

## 3. Location popup cleanup

Removed:

`© OpenStreetMap contributors`

No location API/backend behavior is changed.

The v1.10.28 bottom-sheet location layout remains intact.

---

## Files added

- `src/components/navigation/WorkspaceSwitchModal.tsx`

## Files replaced

- `src/app/AppShellProvider.tsx`
- `src/components/navigation/index.ts`
- `src/screens/customer/CustomerProfileScreen.tsx`
- `src/screens/customer/DefaultLocationScreen.tsx`

---

## Install

1. Keep v1.10.28 as the current working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. Normal Android Studio Run is enough.

A Clean/Rebuild is not required because no native source changed.

---

## QA

### Customer Profile

Check:

- APP SETTINGS section appears
- App language shows English
- App theme shows Light
- Notifications opens Notifications screen

### Workspace switching

Customer Profile:

`Switch to Provider`

Expected:

1. Provider-mode transition popup opens
2. underlying Customer screen remains visible/blurred briefly
3. Provider workspace opens only after the transition

Provider Profile:

`Switch to Customer`

Expected:

1. Customer-mode transition popup opens
2. Provider workspace remains behind the popup briefly
3. Customer workspace opens only after the transition

### Location

Open Default Location.

Confirm:

- popup remains bottom aligned
- `OpenStreetMap contributors` text is gone
- current/manual location UI remains unchanged
