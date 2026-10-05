# Localsewa Android v1.10.17 — Account Security UI Polish

## Base

Apply over:

```text
v1.10.16 — Profile & Account Settings Refinement
```

No npm install is required.

## Changes

### Customer shell restored

Account Security now uses the same Customer shell as Booking Details:

- green Customer header
- Localsewa logo
- Bell notification popup
- Hamburger sidebar
- Customer bottom navigation
- Profile is active in the bottom navigation

### Account email card redesigned

The email identity section now uses:

- Mail icon
- Account email
- Email Verified / Email Not Verified
- Google Linked badge when applicable

### Password & email grouped rows

The old separate boxed rows are replaced by one rounded section using the same
Profile menu-row design language.

Rows:

- Change password
- Set a password (Google-linked accounts only with the current API contract)
- Change account email

### Session action softened

`Sign out all devices` is no longer a large solid red button.

It is now a neutral session-management card with an amber session icon and
supporting text.

The backend behavior is unchanged: all active API sessions are revoked,
including the current device.

### Delete account

Delete account remains inside Account Security, under its own isolated Account
section.

It still opens the existing AccountDeletion flow and does not delete anything
directly from this page.

### Set password capability note

Current Android `/api/profile` mapping exposes:

- emailVerified
- googleLinked

but does not expose a reliable `hasPassword` / `passwordSet` capability flag.

Therefore this release does not invent that state. `Set a password` continues
to appear for Google-linked accounts until the backend exposes a definitive
password-capability field.

This avoids incorrectly hiding the recovery path for Google-first accounts.

## File replaced

```text
src/screens/customer/AccountSecurityScreen.tsx
```

## QA

Check:

- green header visible
- Bell works
- Hamburger works
- bottom navbar visible
- Profile is active
- email card looks consistent with Profile
- Change password opens correct screen
- Set password opens correct screen on Google-linked account
- Change email opens correct screen
- Sign out all devices still works
- Delete account opens Account Deletion
- Android Back returns normally

## Next Profile child pages

After Account Security is approved:

```text
Change Password
Set Password
Change Email
Default Location
Edit Profile
```

Then Profile module can be frozen.
