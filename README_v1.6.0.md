# Localsewa Android v1.6.0 — Authentication Backend Integration

## Summary

v1.6.0 replaces the temporary authentication preview behavior with real
Localsewa backend authentication.

The implementation is based on the production API contracts from the previous
Localsewa Android integration, but rebuilt for the new React Native 0.87
architecture and the fresh v1.x design/navigation system.

## Version

`v1.6.0`

## Backend origin

```text
https://localsewa.com
```

The app preserves Hostinger-compatible PHP routing:

```text
/api/auth/login

→

https://localsewa.com/api/index.php?route=auth%2Flogin
```

No backend credentials are stored in the app.

## Connected backend flows

### Account check

`POST /api/auth/account/check`

Used before login to give a clear unknown-account state.

### Login

`POST /api/auth/login`

Payload:

```json
{
  "identifier": "email-or-mobile",
  "password": "..."
}
```

Expected successful authentication returns:

- opaque bearer token
- account details
- roles

### Registration OTP

`POST /api/auth/registration/otp/request`

Payload includes:

- full_name
- phone
- email
- `intent: customer_signup`

### Customer registration

`POST /api/auth/customer/register`

Payload includes:

- full_name
- phone
- email
- password
- registration_otp

A successful registration returns a real authenticated session, so the user
enters the app without an unnecessary second login.

### Forgot-password OTP

`POST /api/auth/password/otp/request`

Current production contract uses account email for password recovery.

### Password reset

`POST /api/auth/password/update`

The OTP and new password are submitted together.

### Session validation

`GET /api/auth/session`

Used when:

- app launches
- app resumes to foreground

A saved token never grants UI access until the server session is successfully
validated.

### Logout

`POST /api/auth/logout`

The server session is revoked before local token removal.

### Logout all

`POST /api/auth/logout-all`

API support is included in the AuthProvider for the future Account Security UI.

## Security model

### Secure token storage

This version uses:

`react-native-keychain`

Only the opaque 64-character API bearer token is persisted.

The following are NEVER persisted:

- account password
- registration password draft
- registration OTP
- password reset OTP

Registration/password recovery secrets remain memory-only and disappear when
the process/app is destroyed.

### Network outage behavior

A temporary network failure during startup does NOT automatically delete a
potentially valid saved token.

Instead the app shows a secure session-recovery screen:

- Retry
- Use sign in instead

The user is not granted authenticated access until the backend validates the
session.

### Invalid session behavior

HTTP 401/403 from session validation clears the rejected local token and
returns the app to authentication.

## Role routing

Core app roles remain:

- `CUSTOMER`
- `PROVIDER`

Roles returned by the backend are normalized to uppercase.

### Multi-role account

If an account has both roles, v1.6.0 defaults to Customer workspace and allows
switching to Provider.

### Provider-only account

A Provider-only account opens Provider workspace.

### Customer-only account

Provider switching is not shown.

### Localsewa+

Localsewa+ is NOT inferred from authentication roles.

Premium Provider entitlement is intentionally deferred to subscription/
membership integration. Authenticated Providers use Provider Standard theme
until real premium entitlement is loaded from backend.

## Files included

### Add

```text
src/api/apiClient.ts
src/api/authApi.ts

src/auth/AuthProvider.tsx
src/auth/sessionStorage.ts
src/auth/index.ts

src/screens/shared/SessionBootstrapScreen.tsx
src/screens/shared/SessionRecoveryScreen.tsx
src/screens/shared/index.ts
```

### Replace

```text
App.tsx

src/app/AppShellProvider.tsx
src/navigation/RootNavigator.tsx

src/screens/auth/LoginScreen.tsx
src/screens/auth/RegisterScreen.tsx
src/screens/auth/OtpScreen.tsx
src/screens/auth/ForgotPasswordScreen.tsx
src/screens/auth/ResetPasswordScreen.tsx

src/screens/customer/CustomerProfileScreen.tsx
src/screens/provider/ProviderProfileScreen.tsx
```

Existing v1.5.1 Android launcher/splash resources remain unchanged.

## Required dependency

From the Localsewa project root, install:

```powershell
npm install react-native-keychain@10.0.0
```

This package provides Android Keystore-backed secure credential storage.

React Native autolinking handles the native dependency. No manual package
registration should be added.

After installation:

1. Gradle Sync
2. Clean Project
3. Rebuild Project
4. Run app

## Important test accounts

Use only real Localsewa test/customer accounts that you are comfortable using
for development.

Do NOT paste passwords, OTPs, private API tokens or production secrets into
README files or source code.

## QA checklist

### Clean install

1. Uninstall the development app once.
2. Run the app.
3. Confirm Auth flow opens when no token exists.

### Login

1. Enter an unknown account.
2. Confirm clear account-not-found error.
3. Enter a valid customer email/mobile and password.
4. Confirm real login succeeds.
5. Confirm Customer workspace opens.
6. Kill app.
7. Reopen app.
8. Confirm saved token is validated and session restores.

### Provider role

1. Login with an account containing `PROVIDER`.
2. Confirm Customer Profile shows `Switch to Provider` for multi-role account.
3. Switch to Provider.
4. Confirm Provider Standard theme appears.
5. Switch back to Customer.

### Registration

1. Enter real test registration data.
2. Tap Send verification code.
3. Confirm email OTP arrives.
4. Enter OTP.
5. Confirm account is created and authenticated.

### Forgot password

1. Enter account email.
2. Confirm reset OTP arrives.
3. Enter OTP.
4. Create a new password.
5. Confirm return to Login.
6. Login with the new password.

### Session failure

1. Login successfully.
2. Disable emulator network.
3. Relaunch.
4. Confirm the app does not silently delete the saved token.
5. Confirm Session Recovery screen appears.
6. Restore network and Retry.
7. Confirm session restores.

### Logout

1. Login.
2. Profile → Sign out.
3. Confirm backend logout succeeds.
4. Confirm app returns to Auth.
5. Relaunch and confirm session does not restore.

## Known limitations

- Google Sign-In is intentionally disabled in v1.6.0.
- Account Security/change-password UI is not connected yet, although the core
  auth architecture is ready for it.
- Localsewa+ entitlement is not fetched yet.
- Provider onboarding is not part of this milestone.
- No Customer service/provider/booking backend data is connected in this
  version.
- Inter font is still pending.
- Production validation rules may need small UI adjustments after live API QA.

## Next — what we will do after v1.6.0

### v1.6.1 — Native Google Sign-In & Auth Hardening

Before Google Sign-In, we will lock the production Android application ID,
because Android OAuth credentials depend on package name + signing certificate.

Then we will:

1. Finalize production Android package/application ID.
2. Configure Android Google OAuth client.
3. Connect native Google Sign-In.
4. Exchange/verify Google identity with Localsewa backend.
5. Preserve same-email account linking.
6. Add login/register field validation.
7. Add password visibility controls.
8. Improve OTP resend timing/error states.
9. Add auth success feedback.
10. Run complete auth regression QA.

### v1.7.0 — Customer Backend Foundation

After authentication is stable, we will start real Customer data:

1. Customer Home data
2. Service/category catalog
3. Provider discovery
4. Provider details
5. Saved Providers

Then booking creation/lifecycle will follow in the next module.
