# Localsewa Android v1.10.0 — Customer Profile & Account Settings

## Summary

v1.10.0 removes the remaining Customer Profile placeholder and replaces it with
a real native account workspace.

The release connects low-risk/profile-safe backend functionality first:

- real customer profile read
- real customer profile update
- verified default-location update
- real logout-all
- real account-deletion status read
- Help & Support native UI
- Terms native UI summary
- Privacy native UI summary

High-risk session-revoking/destructive account mutations are intentionally
staged for v1.10.1 so they can be tested together:

- change password
- set password
- change email
- schedule account deletion

This avoids shipping several sensitive writes in one unverified batch.

## Version

`v1.10.0`

## Real backend routes connected

### Customer profile

```text
GET /api/profile
PUT /api/profile
```

Ordinary profile updates edit customer identity/contact fields.

Email is deliberately NOT changed through ordinary profile update.

### Default location

```text
PUT /api/profile/location
```

The app first verifies the address using the existing Localsewa location proof
flow, then submits:

```text
location/address
latitude
longitude
area_label
location_source = DEFAULT
verification_token
```

Coordinates are never guessed from the typed label.

### Logout all

Already present in the auth foundation:

```text
POST /api/auth/logout-all
```

Account Security now exposes it as a real action.

### Account deletion status

```text
GET /api/account/deletion
```

The app displays:

```text
state
requested_at
scheduled_for
cancelled_at
completed_at
remaining_days
can_restore_by_login
grace_period_days
```

The deletion screen is intentionally read-only in v1.10.0.

## Customer Profile redesign

The old placeholder card is removed.

Profile now contains:

```text
Account identity card
Default location summary

Account
  Edit profile
  Default location
  Account security

Support & legal
  Help & Support
  Terms & Conditions
  Privacy Policy

Switch to Provider (only if account has Provider capability)

Delete account
Sign out
```

## Edit Profile

Real backend update for:

```text
full name
mobile
WhatsApp
```

Email is shown read-only because Localsewa protects email replacement with a
dedicated verification flow.

## Profile photo — intentionally deferred

The backend supports:

```text
POST /api/profile/image
multipart field: image
max source size: 5 MB
```

However the backend audit found a privacy issue:

ordinary JPEG/PNG/WebP uploads can currently be stored without stripping
embedded EXIF/device metadata.

Therefore v1.10.0 does NOT add a native image picker or profile-photo upload
button.

This is a deliberate privacy decision, not a missing UI accident.

Required before enabling:

1. harden server image normalization/metadata stripping, or explicitly accept
   the existing behavior
2. add native photo picker
3. upload QA
4. orientation/size QA
5. privacy regression test

## Account Security

v1.10.0 includes:

- current email display
- verified/unverified state
- real `Sign out all devices`
- reserved Change Password row
- reserved Change Email row

Change Password and Change Email will be connected in v1.10.1.

## Help & Support

Uses the approved clean native accordion design language.

Topics included:

- booking states
- chat/call eligibility
- verified locations
- account access/security

The screen links to the main Localsewa website for current support/contact
information rather than inventing a support email/phone that was not verified.

## Terms & Conditions

Native accordion summary plus:

```text
https://localsewa.com/terms
```

The in-app copy explicitly states that it is a product summary and that the
published policy remains authoritative.

The Android build does not invent jurisdiction, refund guarantees or legal
promises.

## Privacy Policy

Native accordion summary covers factual app behavior:

- account/profile data
- booking/message data
- location data
- secure native session-token storage
- account deletion lifecycle

Official link:

```text
https://localsewa.com/privacy
```

Again, the published policy remains authoritative.

## Account deletion

Backend behavior confirmed:

- password OR verified-email OTP confirmation
- 30-day grace period
- scheduling revokes all API sessions
- verified login during eligible grace period can cancel the request
- due deletion is finalized by backend cleanup

v1.10.0 only reads and explains current status.

This prevents accidental testing against a real production user while the
password/email OTP native security flows are not yet complete.

## Files added

```text
src/types/account.ts
src/api/accountApi.ts
src/hooks/useAccount.ts

src/components/account/AccordionCard.tsx
src/components/account/SettingsRow.tsx
src/components/account/index.ts

src/screens/customer/EditCustomerProfileScreen.tsx
src/screens/customer/DefaultLocationScreen.tsx
src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/HelpSupportScreen.tsx
src/screens/customer/TermsConditionsScreen.tsx
src/screens/customer/PrivacyPolicyScreen.tsx
src/screens/customer/AccountDeletionScreen.tsx
```

## Files replaced

```text
src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/screens/customer/CustomerProfileScreen.tsx
src/screens/customer/index.ts
```

## Dependencies

No new npm package is required.

Do NOT install an image picker for v1.10.0.

## Install

1. Copy/replace the ZIP files into the existing Localsewa project.
2. No npm command is required.
3. Run through Android Studio.
4. Login with a Customer account.
5. Open Profile.

## QA checklist

### Customer Profile

1. Old placeholder must be gone.
2. Real name/email/mobile load.
3. Verification badges are correct.
4. Saved default location appears when available.
5. Provider switch only appears for Provider-capable account.

### Edit Profile

Use a test account.

1. Edit full name.
2. Edit mobile.
3. Edit WhatsApp.
4. Save.
5. Return to Profile.
6. Confirm changes are still present after app reload.
7. Confirm email is not editable here.

### Default Location

1. Enter a complete address.
2. Verify.
3. Save.
4. Return to Profile.
5. Confirm saved location appears.
6. Edit the typed address before save and ensure old verification is discarded.
7. Do not accept guessed coordinates.

### Account Security

1. Confirm account email.
2. Confirm verification state.
3. `Sign out all devices` with a test account.
4. Confirm current device is also signed out because all API tokens are revoked.
5. Login again.

### Help / Terms / Privacy

1. Open each screen.
2. Expand/collapse sections.
3. Android system Back should work.
4. Official links should hand off to browser.

### Account Deletion

1. Open screen.
2. Confirm current deletion state loads.
3. If no request exists, see `No deletion request`.
4. If test account has pending deletion, confirm remaining days and schedule.
5. Confirm there is NO destructive schedule button in this version.

## Known limitations / intentionally pending necessary work

### v1.10.1 account security writes

- Change Password
- Set Password for no-password/Google-only accounts
- Change Email
- Schedule Account Deletion via password/OTP
- security/session regression after these writes

### Profile image

- backend metadata stripping fix
- native image picker/upload

### Android push

Still on hold:

- FCM
- device token API
- push sender
- Android notification permission/channel
- background/killed-app routing

### Voice calling

Still on hold:

- WebRTC
- signaling
- microphone/audio routing
- speaker/mute connected to real media
- incoming call/ringtone/background handling

### Google Sign-In

Still on hold until main UI flows are built.

### Provider notification deep-linking

Workspace switching exists, but detailed Provider request routes wait for the
real Provider stack.

### Final icon system

Temporary letter/glyph controls in navigation/call UI still need final icons.

## Next milestone

### v1.10.1 — Account Security Writes

Next we will implement the sensitive verified flows one at a time:

```text
Change Password
  current password
  → email OTP
  → new password
  → sessions revoked
  → sign in again

Set Password
  verified email OTP
  → new password

Change Email
  new email
  → OTP to new email
  → verify/update
  → refresh identity

Delete Account
  warning
  → password OR verified-email OTP
  → final confirmation
  → schedule 30-day deletion
  → all sessions revoked
```

After v1.10.1 passes, Customer account/settings can be treated as functionally
complete enough to move into the real Provider workspace.
