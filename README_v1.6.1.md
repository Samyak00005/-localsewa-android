# Localsewa Android v1.6.1 — Authentication Hardening

## Summary

v1.6.1 hardens the real authentication foundation introduced in v1.6.0.

Google Sign-In is intentionally placed on hold. It will be implemented only
after the main Customer and Provider UI flows are substantially built.

This version does NOT change the production Android application ID and does NOT
add OAuth configuration.

## Version

`v1.6.1`

## What changed

### 1. Google Sign-In held

Google controls have been removed from the active authentication UI.

The existing Google component file may remain in the source tree for future
reuse, but it is not shown or invoked by Login, Register or Auth Landing.

No fake Google success behavior exists.

### 2. Safer login flow

Login now sends credentials directly to the real login endpoint.

The separate pre-login account-existence check is no longer used by the client.

Reason:

- removes an unnecessary network request
- reduces client-side account-enumeration behavior
- keeps authentication errors driven by the actual login endpoint

The backend account-check function may remain available for future flows where
it is genuinely needed.

### 3. Client-side validation

Added:

`src/utils/authValidation.ts`

Validation includes:

- email format
- phone normalization/format
- email-or-phone identifier
- full-name length
- password length
- exact 6-digit OTP format

Backend validation remains authoritative. Client validation exists to prevent
obviously malformed requests and improve UX.

### 4. Password visibility

Added reusable:

`src/components/auth/PasswordInput.tsx`

Login, Register and Reset Password now support:

- Show password
- Hide password
- accessibility labels
- native password autofill metadata

No password value is persisted.

### 5. Input component hardened

`Input.tsx` now supports:

- left accessory
- right accessory
- improved selection color
- cleaner border/frame structure
- accessibility-friendly reusable password actions

### 6. Error/success banners

Added:

`AlertBanner`

Variants:

- error
- success
- info

Auth failures no longer appear as loose red text.

Password-reset success returns to Login with a visible success banner.

### 7. OTP resend timing

The first resend countdown now uses the backend-provided:

`resend_after`

instead of always starting from a hardcoded 30-second value.

Subsequent resend requests also reset the timer from the server response.

### 8. OTP entry hardening

OTP input now:

- accepts digits only
- limits to 6 digits
- validates exactly 6 digits
- uses native one-time-code autofill metadata
- supports keyboard submit

### 9. Autofill and keyboard metadata

Auth fields now declare appropriate mobile metadata such as:

- username
- current-password
- new-password
- name
- telephone
- email
- one-time-code

This improves Android autofill/password-manager behavior.

### 10. Registration normalization

Before backend calls:

- email is trimmed and lowercased
- phone separators/spaces are normalized
- name is trimmed

Sensitive password/OTP data remains memory-only.

## Files included

### Add

```text
src/components/ui/AlertBanner.tsx
src/components/auth/PasswordInput.tsx
src/utils/authValidation.ts
```

### Replace

```text
src/components/ui/Input.tsx
src/components/ui/index.ts
src/components/auth/index.ts

src/navigation/types.ts
src/auth/AuthProvider.tsx

src/screens/auth/AuthLandingScreen.tsx
src/screens/auth/LoginScreen.tsx
src/screens/auth/RegisterScreen.tsx
src/screens/auth/ForgotPasswordScreen.tsx
src/screens/auth/OtpScreen.tsx
src/screens/auth/ResetPasswordScreen.tsx
```

## Dependencies

No new npm package is required.

Keep the existing v1.6.0 dependency:

```text
react-native-keychain@10.0.0
```

## Google Sign-In status

HOLD.

Do not configure:

- Android OAuth client
- SHA-1
- Google package/client credentials
- Web Client ID
- native Google SDK

yet.

The final application/package ID migration is also deferred until Google login
or Play Store identity work resumes.

User-facing app name remains exactly:

`Localsewa`

## QA checklist

### Login

1. Empty identifier → client validation.
2. Malformed email → client validation.
3. Malformed mobile → client validation.
4. Empty password → client validation.
5. Wrong password → backend error banner.
6. Correct credentials → login succeeds.
7. Show/Hide password works.
8. Password is hidden by default.

### Registration

1. Invalid name → blocked.
2. Invalid mobile → blocked.
3. Invalid email → blocked.
4. Password under 8 chars → blocked.
5. Mismatched passwords → blocked.
6. Valid form → real OTP request.
7. First OTP resend countdown uses backend timing.
8. OTP accepts digits only.
9. Wrong OTP → backend error banner.
10. Correct OTP → account creation/session succeeds.

### Forgot Password

1. Invalid email → blocked locally.
2. Valid email → real OTP request.
3. Resend timing works.
4. OTP autofill/entry works.
5. New password supports Show/Hide.
6. Mismatch is blocked.
7. Successful reset returns to Login.
8. Login shows password-updated success banner.
9. New password works with real backend login.

### Session/logout regression

Re-run v1.6.0 checks:

- secure session restore
- offline session-recovery screen
- Customer/Provider role routing
- sign out
- relaunch after sign out

## Known limitations

- Google Sign-In is intentionally not implemented.
- Production package/application ID is not migrated yet.
- Provider Localsewa+ entitlement is not connected yet.
- Provider onboarding is not connected.
- Customer home/services/provider data is not connected yet.
- Inter font is still pending.
- Password strength is intentionally simple client-side validation; server
  rules remain authoritative.
- Show/Hide currently uses text labels. Final iconography will replace these
  after the production icon system is introduced.

## Next milestone — what we will do next

### v1.7.0 — Customer Backend Foundation

Now that authentication is stable, we will move into real Customer product UI
and backend data.

Planned first module:

1. Replace Customer Home placeholder with a real mobile-native Home screen.
2. Connect real service/category data.
3. Connect real provider discovery.
4. Show provider availability/rating/location data from backend.
5. Build Services list/search foundation.
6. Build Provider Details foundation.
7. Connect Saved Providers read state.
8. Add proper skeleton/error/empty states.
9. Keep all pages using the shared v1.3+ components and Customer theme.

We will not copy the old Android UI.

### After v1.7.0

Expected sequence:

```text
v1.7.x  Customer Home / Services / Providers
v1.8.x  Booking creation + booking lifecycle
v1.9.x  Customer Profile / account settings
v2.0.x  Provider workspace real UI/backend
```

Google Sign-In will be inserted later without blocking these core modules.
