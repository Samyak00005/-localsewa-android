# Localsewa Android v1.10.14 — Customer Profile UI Polish

## Base

Apply this build over:

```text
v1.10.13 — Saved Providers Refinement
```

No new npm package is required.

## Goal

Turn Customer Profile into a clean **account hub** instead of a collection of
unrelated cards.

The page keeps existing backend/account behavior and only exposes actions that
already exist in the native Customer flow.

---

## Page structure

```text
Profile
Manage your account, location, security and support.

[ Circular profile identity card ]
Name
Email
Phone
verification badges
[ Edit profile ]

[ Personal summary ]
Email
Mobile
Default location

ACCOUNT & SETTINGS
Default location
Account security

PROVIDER WORKSPACE
Switch to Provider
(only for accounts that already have Provider capability)

HELP & LEGAL
Help & Support
Terms & Conditions
Privacy Policy

[ Log out ]

Delete account
```

The normal Customer green header and Customer bottom navigation remain supplied
by `CustomerTabs`.

---

## 1. Profile identity card

The top card now uses a centered, cleaner identity hierarchy:

- circular profile image
- circular initials fallback
- full name
- email
- phone
- Email Verified badge when returned by backend
- Google Linked badge when returned by backend
- Edit profile button

The profile image shape is always circular.

### Profile-photo editing

This release does **not** add a new photo picker/upload action.

Existing profile images are displayed if returned by `/api/profile`.

Actual native profile-photo upload remains intentionally deferred until the
planned backend image metadata / EXIF privacy hardening is complete.

---

## 2. Personal summary

A compact summary below the identity card shows:

```text
Email
Mobile
Default location
```

Missing values are shown as:

```text
Not added
Not set
```

No coordinates are displayed.

---

## 3. Account & settings

### Default location

Opens the existing:

```text
DefaultLocation
```

screen.

The row also shows whether a default location is already saved.

### Account security

Opens:

```text
AccountSecurity
```

The existing Account Security screen remains the single source for:

- password flows
- email change
- session controls
- sign out all devices

This avoids duplicating security logic on Profile.

---

## 4. Notifications are not duplicated on Profile

The Customer header already provides the approved Bell notification popup on
every primary Customer tab, including Profile.

Therefore v1.10.14 does not add another Notifications feed row to Profile.

This keeps the account hub cleaner and avoids having two different primary
notification entry patterns.

---

## 5. Provider workspace

If the signed-in account already has Provider capability:

```text
Switch to Provider
```

appears.

Tap uses the existing:

```text
enterProvider()
```

workspace transition.

### Customer-only accounts

A fake `Become a Provider` button is **not** added in this release because the
current Android Customer navigation does not yet contain a verified native
provider-onboarding destination.

We should add that CTA only when its real native onboarding flow is connected.

---

## 6. Help & legal

Grouped into one rounded section:

```text
Help & Support
Terms & Conditions
Privacy Policy
```

Each row opens the existing native page.

---

## 7. Log out

Log out is now a clean standalone pill button near the bottom.

It continues using the existing authenticated logout implementation.

Loading and failure states are preserved.

---

## 8. Delete account

Delete Account remains visually isolated at the bottom.

It opens the existing:

```text
AccountDeletion
```

flow.

The Profile page does not directly delete the account.

The existing 30-day deletion lifecycle remains unchanged.

---

## 9. Shared menu-row component

Added:

```text
src/components/account/ProfileMenuRow.tsx
```

It provides a consistent Profile setting row with:

- circular icon container
- title
- optional subtitle
- optional value
- right chevron
- destructive variant

This is separate from the older generic `SettingsRow`, so existing security and
secondary pages are not visually changed by this release.

---

## 10. Icon system

Added:

```text
logOut
```

to the shared Lucide `AppIcon` system for the Profile Log out action.

No new package is required.

---

## Files added

```text
src/components/account/ProfileMenuRow.tsx
```

## Files replaced

```text
src/components/icons/AppIcon.tsx
src/components/account/index.ts
src/screens/customer/CustomerProfileScreen.tsx
```

---

## Dependencies

No npm install.

Continue using the already pinned:

```text
lucide-react-native@1.21.0
react-native-svg
```

---

## Install

1. Keep v1.10.13 as the current baseline.
2. Copy/replace this ZIP content into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do not run `npm install`.
4. Run normally from Android Studio.

---

## Real-device QA

### Profile shell

Confirm:

- green Customer header remains
- Bell popup still works
- Hamburger sidebar still works
- bottom navigation remains
- Profile is selected in bottom navigation

### Identity card

Check:

- real image is circular
- no-image fallback is circular
- name is readable
- email/phone do not overflow
- verification badges wrap properly
- Edit profile opens the existing Edit Profile screen

### Default location

Check:

- correct saved location is shown
- no coordinates are exposed
- Default location row opens the correct page

### Security

Check:

- Account security opens
- Change Password / Set Password / Change Email behavior inside Security is
  unchanged
- Sign out all devices remains available there

### Provider account

On an account with Provider role:

- Switch to Provider appears
- tap switches to Provider workspace

On Customer-only account:

- no fake Provider onboarding action appears

### Help/legal

Check all three routes:

- Help & Support
- Terms & Conditions
- Privacy Policy

### Account actions

Check:

- Log out works
- loading state works
- Delete account opens deletion lifecycle
- no accidental direct deletion happens

---

## Next Customer UI milestone

After Profile is approved:

```text
Provider Details + Booking Request UI Polish
```

Then:

```text
Chat / notification secondary consistency
Account / security / location final polish
Final Customer regression
Customer UI freeze
v2.0.0 Provider Workspace
```
