# Localsewa Android v1.10.16 — Profile & Account Settings Refinement

## Base

Apply this build over:

```text
v1.10.15 — Profile Refinement
```

No new npm package is required.

## Changes

### 1. Personal summary now starts with Name

The second Profile card now uses this exact order:

```text
Name
Email
Mobile
```

`Default location` has been removed from this summary card.

### 2. Name / Email / Mobile now have icons

The summary rows now use circular icon containers:

```text
Name    → User icon
Email   → Mail icon
Mobile  → Phone icon
```

This matches the icon language used by the rest of the Customer account UI.

### 3. Delete account removed from Profile page

`Delete account` is no longer shown directly inside Profile → Account & settings.

Profile now contains:

```text
ACCOUNT & SETTINGS

Default location
Account security
```

### 4. Delete account moved inside Account Security

The existing Account Security page now contains an additional section:

```text
Account

Delete account
Review the 30-day deletion process and verification steps
```

Tap still opens the existing:

```text
AccountDeletion
```

flow.

The 30-day deletion lifecycle and verification behavior are unchanged.

### 5. Default Location is no longer duplicated

Profile now displays Default Location only once:

```text
ACCOUNT & SETTINGS
→ Default location
```

The personal summary contains only:

```text
Name
Email
Mobile
```

### 6. Log out now has a distinct visual treatment

The old generic secondary button is replaced with a dedicated neutral logout
action:

```text
[ logout icon ]  Log out
                 Sign out from this device
```

It uses:

- muted neutral surface
- dedicated circular logout icon
- two-line hierarchy
- no destructive red treatment

This keeps Log out visually different from normal settings rows while still
being clearly less destructive than Delete account.

## Files replaced

```text
src/screens/customer/CustomerProfileScreen.tsx
src/screens/customer/AccountSecurityScreen.tsx
```

## Dependencies

No npm install.

## Install

1. Keep v1.10.15 as the current baseline.
2. Copy/replace this ZIP into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do not run `npm install`.
4. Run normally from Android Studio.

## Real-device QA

### Profile summary

Confirm order:

```text
Name
Email
Mobile
```

Check all three rows have icons.

### Default location

Confirm it appears only once on Profile:

```text
Account & settings
→ Default location
```

### Delete account

Confirm:

- Delete account is NOT visible on Profile
- Account security opens
- Account Security contains `Delete account`
- Delete account still opens the existing Account Deletion screen

### Log out

Confirm:

- logout no longer looks like a normal green/secondary app button
- neutral logout card is visually distinct
- `Sign out from this device` appears
- logout still works

## Next milestone

After this Profile refinement is approved:

```text
Provider Details + Booking Request UI Polish
```
