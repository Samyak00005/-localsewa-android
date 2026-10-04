# Localsewa Android v1.10.1 — Account Security Writes

## Summary

v1.10.1 completes the sensitive Customer account-security flows that were
intentionally staged after v1.10.0.

Connected:

- Change Password with current password + email OTP
- Set Password for Google-first/no-user-password accounts
- Change Account Email with OTP to the new email
- Schedule Account Deletion using password OR verified-email OTP
- 8–72 character native password validation
- secure local-session clearing after security boundaries

No new npm/native dependency is required.

## Version

`v1.10.1`

## Verified backend route family

The inspected backend exposes:

```text
POST /api/account/password/set/otp/request
POST /api/account/password/set

POST /api/account/password/otp/request
POST /api/account/password/update

POST /api/account/email/otp/request
POST /api/account/email/update

GET  /api/account/deletion
POST /api/account/delete/otp/request
POST /api/account/delete
```

Authenticated calls use the existing Bearer token.

## OTP security policy

Current source policy:

- 6-digit OTP
- approximately 10-minute validity
- 60-second resend cooldown
- limited verification attempts
- limited requests per subject/window
- additional IP-level controls
- previous OTP is invalidated only after replacement delivery succeeds
- OTPs are stored hashed, not plaintext

The native app uses the server-reported resend delay where available.

## Change Password

Flow:

```text
Account Security
→ Change password
→ Current password
→ Request email OTP
→ 6-digit OTP
→ New password
→ Confirm password
→ Update
→ server revokes sessions
→ Android clears secure token
→ Sign In
```

Native validation prevents:

- empty current password
- invalid OTP format
- new password below 8 chars
- new password above 72 chars
- password mismatch
- same current/new password

Backend remains authoritative.

## Set Password

This route is for Google-first accounts that have not chosen a Localsewa
password.

Flow:

```text
Set a password
→ email OTP
→ new password
→ confirm
→ update
→ local session cleared
```

Important:

`google_linked = true` does not prove the account has no password. An existing
password account can also be linked to Google.

Therefore the app labels this explicitly as a Google-first-account feature and
lets the backend reject accounts for which Set Password is not eligible.

The app does not attempt to infer password-hash state from profile payload
because the backend deliberately does not expose it.

## Change Email

Flow:

```text
Current email
→ New email
→ OTP to NEW address
→ verify
→ replace account email
→ local reauthentication boundary
```

Ordinary `/profile` update is never used to change account email.

The Android client uses the dedicated verified email endpoints.

After success the local secure session is cleared and the user signs in again.

## Account Deletion

This is a REAL production-write flow.

### Method 1 — password

```text
Delete Account
→ Password
→ type DELETE
→ Schedule account deletion
```

### Method 2 — verified email OTP

```text
Delete Account
→ Email OTP
→ 6-digit code
→ type DELETE
→ Schedule account deletion
```

The backend accepts password or OTP confirmation.

After scheduling:

- deletion state becomes pending
- scheduled time is approximately +30 days
- all API tokens are revoked
- Android clears the local secure token
- user returns to authentication

An eligible verified sign-in during the grace period can cancel pending
deletion according to the existing backend lifecycle.

## Critical deletion QA rule

Do NOT test this against your primary production account.

Use a disposable/test account.

Although the backend has a recovery/grace lifecycle, scheduling is still a real
security/account mutation and immediately revokes sessions.

## Subscription warning

Backend audit found an important policy gap in earlier account-deletion review:
subscription cancellation/renewal timing during the 30-day deletion grace
period needs separate product verification.

Therefore the Android deletion page explicitly warns that account deletion must
not be treated as the UI for managing a Provider Localsewa+ subscription.

This build does not change Razorpay/subscription logic.

## Password policy correction

The native validation helper now uses:

```text
8–72 characters
```

instead of the earlier Android max of 128.

This aligns the app security UI with the established Localsewa password
standard.

## Files added

```text
src/api/accountSecurityApi.ts
src/hooks/useAccountSecurity.ts

src/components/account/SecurityOtpStatus.tsx

src/screens/customer/ChangePasswordScreen.tsx
src/screens/customer/SetPasswordScreen.tsx
src/screens/customer/ChangeEmailScreen.tsx
```

## Files replaced

```text
src/utils/authValidation.ts

src/components/account/index.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/AccountDeletionScreen.tsx
src/screens/customer/index.ts
```

## Dependencies

No new package.

Do not run any npm install command for v1.10.1.

## Install

1. Stop/reload the current app.
2. Copy this ZIP into the existing project root.
3. Replace matching files.
4. Run through Android Studio.

## QA — Change Password

Use a test password account.

1. Wrong current password → must fail.
2. Correct password → OTP email.
3. Resend disabled during cooldown.
4. Wrong OTP → fail.
5. Password under 8 → blocked locally.
6. Password over 72 → blocked/limited.
7. Same current/new → blocked locally and backend remains authoritative.
8. Correct OTP + valid new password → success.
9. App returns to Auth because session is cleared/revoked.
10. Old password must fail.
11. New password must work.

## QA — Set Password

Use a Google-first/no-user-password test account only.

1. Request OTP.
2. Verify OTP.
3. Set 8–72 char password.
4. Confirm app signs out.
5. Password login with new password succeeds.
6. On an account that already has a valid password, backend should reject Set
   Password rather than replacing it silently.

## QA — Change Email

Use a disposable/test account.

1. Enter same current email → blocked locally.
2. Invalid email → blocked.
3. Existing/duplicate email → backend should reject.
4. Valid unused new email → OTP sent to NEW address.
5. Change typed email after OTP request → flow resets.
6. Wrong/expired OTP → fail.
7. Correct OTP → email changes.
8. App clears local session.
9. Login with old email should no longer represent the changed identity.
10. Login with new email + password should work if the account has a password.

## QA — Account Deletion

Use a disposable test account only.

### Password path

1. Open Delete Account.
2. Select Password.
3. Wrong password → fail.
4. Do not type DELETE → button/submit blocked.
5. Correct password + DELETE → schedule deletion.
6. App signs out.
7. Login during grace period with valid credentials → backend should cancel the
   pending deletion where account state is eligible.

### OTP path

1. Account must have verified email.
2. Request deletion code.
3. Wrong code → fail.
4. Correct code + DELETE → schedule deletion.
5. App signs out.
6. Verify deletion status only after recovery login if you intentionally restore
   the test account.

## Security behavior

- Passwords and OTPs are never persisted to AsyncStorage/files.
- Secure API bearer token remains in react-native-keychain.
- Security screens keep secrets only in component memory.
- Sensitive mutations do not automatically retry.
- Account deletion requires an explicit method plus typed DELETE.
- Server-side validation and authorization remain authoritative.

## Still pending / necessary later

Preserved from previous milestones:

### Push notifications
- FCM
- device token backend API
- push sender
- Android permission/channel
- background/killed-app routing

### Real calling
- WebRTC
- signaling
- microphone
- audio route
- speaker/mute connected to media
- ringtone/incoming lifecycle/background

### Profile image
- server-side EXIF/device-metadata stripping
- Android image picker
- upload QA

### Google Sign-In
- production package/application identity
- Android OAuth
- same-account native login/linking

### Provider notification routes
- full request/detail deep-links after Provider native stack is real

### Final icons
- replace temporary letters/glyphs across navigation/call UI

## Next milestone

### v2.0.0 — Provider Workspace Foundation

Customer core is now sufficiently complete to start the real Provider
workspace.

Planned sequence:

```text
Provider Home / Dashboard
Provider booking Requests
Request Details
Accept / Reject
In Progress / Complete / Not Completed
Provider Services
Reviews
Provider Profile
Customer ↔ Provider switch
Localsewa+ entitlement state
```

We will keep Localsewa+ as a Provider entitlement/tier, NOT as a third app role.

Initial v2.0.0 will focus on real Provider dashboard/request data and the dark
forest-green Provider Standard design. Premium entitlement styling will remain
separate from core Provider authorization.
