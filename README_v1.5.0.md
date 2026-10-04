# Localsewa Android v1.5.0 — Brand Splash & Authentication UI Foundation

## Summary

This version introduces the first branded authentication experience for the
fresh Localsewa React Native Android app.

It uses the user-provided Localsewa logo, starts the app in the authentication
flow, adds a branded startup splash preview, and builds the complete UI
navigation shell for login, registration, OTP verification and password
recovery.

Backend authentication is intentionally NOT connected in this version.

## Version

`v1.5.0`

All Localsewa Android deliverables use three-part semantic versioning.

## Branding rule

The user-visible application name is always:

`Localsewa`

Do not show `LocalsewaApp` in launcher labels, splash branding or app UI.

`LocalsewaApp` may remain an internal React Native project/component identifier
where technically required.

## User-provided logo

Included as:

`src/assets/branding/localsewa-logo.png`

The original supplied image was square and high-resolution. This version
contains an optimized 512×512 app-UI copy.

This full logo is used for:

- App-level branded splash preview
- Authentication landing
- Authentication brand header

## Authentication flow

```text
Brand Splash
    ↓
Auth Landing
    ├── Sign in
    │     ├── Forgot Password
    │     │      ↓
    │     │     OTP
    │     │      ↓
    │     │   Reset Password
    │     │
    │     └── Customer workspace preview
    │
    ├── Create Account
    │      ↓
    │   Registration form
    │      ↓
    │     OTP
    │      ↓
    │   Customer workspace preview
    │
    └── Continue with Google
          (UI only in v1.5.0)
```

## Screens added

- `BrandSplashScreen`
- `AuthLandingScreen`
- `LoginScreen`
- `RegisterScreen`
- `OtpScreen`
- `ForgotPasswordScreen`
- `ResetPasswordScreen`

## Shared auth components added

- `AuthScreenLayout`
- `GoogleSignInButton`

## Files included

### Replace

- `src/app/AppShellProvider.tsx`
- `src/navigation/types.ts`
- `src/navigation/AuthNavigator.tsx`
- `src/screens/auth/AuthLandingScreen.tsx`
- `src/screens/auth/index.ts`

### Add

- `src/assets/branding/localsewa-logo.png`
- `src/components/auth/AuthScreenLayout.tsx`
- `src/components/auth/GoogleSignInButton.tsx`
- `src/components/auth/index.ts`
- `src/screens/auth/BrandSplashScreen.tsx`
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/RegisterScreen.tsx`
- `src/screens/auth/OtpScreen.tsx`
- `src/screens/auth/ForgotPasswordScreen.tsx`
- `src/screens/auth/ResetPasswordScreen.tsx`
- `README_v1.5.0.md`

## Dependencies

No new npm package is required for v1.5.0.

It uses:

- React Navigation packages already installed in v1.4.0
- React Native primitives
- Existing Localsewa UI primitives
- `react-native-safe-area-context`

## Authentication UI decisions

### One common account system

Customer and Provider do NOT get separate duplicate login pages.

A Localsewa account may later contain:

- Customer capability
- Provider capability

Backend role/session data will determine the available workspace after real
authentication is integrated.

### Registration fields

The UI currently includes:

- Full name
- Mobile number
- Email
- Password

The fields are intentionally aligned with known Localsewa account/backend
requirements, but no request is sent yet.

### Google Sign-In

The Google control is UI-only.

No Google SDK/token/backend exchange is implemented in this version.

### OTP

OTP is UI-only.

Registration OTP currently previews success by opening the Customer workspace.
Password OTP continues to the Reset Password screen.

Real OTP request/verification APIs will replace these temporary actions later.

## Splash note

v1.5.0 includes an app-level branded splash preview implemented in React Native.

The final Android launcher icon and Android 12+ native system splash/adaptive
icon resources are NOT finalized in this version.

Those are planned for:

`v1.5.1 — Native Launcher Icon & Splash Branding`

This separation prevents us from forcing the full text-heavy logo into Android
adaptive-icon masks before a clean icon-only asset has been prepared.

## Important logo recommendation

The full supplied logo contains:

- Graphic mark
- `LocalSewa` wordmark
- `Fast • Trusted • Nearby` tagline

It is suitable for splash/auth branding.

For the Android launcher icon, an icon-only crop should be used later:

- Blue rounded square
- House/tools/location-pin graphic
- No bottom tagline
- Preferably no `LocalSewa` wordmark

This improves readability at small launcher sizes.

## Test checklist

After copying the files:

1. Run the app.
2. Confirm the branded Localsewa splash appears.
3. Confirm it automatically opens Auth Landing.
4. Confirm `Sign in` opens Login.
5. Confirm `Create an account` opens Register.
6. Confirm Register → Continue opens OTP.
7. Confirm registration OTP → Verify opens Customer workspace preview.
8. From Login, confirm Forgot Password opens recovery.
9. Confirm Forgot Password → OTP → Reset Password flow works.
10. Confirm Google buttons render without crashes.
11. Confirm Android system Back works through auth screens.
12. Confirm no user-visible `LocalsewaApp` branding appears.
13. Confirm no red-screen runtime error appears.

## Known limitations

- Authentication is not connected to backend APIs.
- OTP is not sent or verified.
- Google Sign-In is not connected.
- Password validation is not implemented.
- Session persistence is not implemented.
- The startup splash is React Native-level, not yet the final native Android
  system splash.
- Launcher/adaptive icon resources are not finalized.
- Inter font is still pending.
- Real production icons for navigation/actions are still pending.

## Next planned milestone

`v1.5.1 — Native Launcher Icon & Splash Branding`

Planned:

- Prepare icon-only Localsewa launcher artwork from the supplied brand asset
- Android adaptive icon foreground/background
- Round launcher icon
- Android 12+ native splash branding
- Verify installed app label is exactly `Localsewa`
- Launcher/splash QA on Pixel 9 API 36

After brand assets are stable:

`v1.6.0 — Authentication Backend Integration`
