# Localsewa Android v1.5.1 — Native Launcher Icon & Splash Branding

## Summary

This patch adds native Android branding to the fresh Localsewa app.

It uses the logo supplied by the user and prepares a cleaner icon-only launcher
artwork from the house/tools/location portion of that logo so Android does not
try to squeeze the `LocalSewa` wordmark and tagline into a tiny launcher icon.

## Version

`v1.5.1`

## User-visible application name

The Android display name is locked to:

`Localsewa`

The included:

`android/app/src/main/res/values/strings.xml`

contains:

```xml
<string name="app_name">Localsewa</string>
```

The internal React Native project/component identifier may still be
`LocalsewaApp`. That identifier is not user-facing.

## Brand asset treatment

### Full supplied logo

The full logo remains appropriate for:

- React authentication branding
- In-app splash/brand bridge
- Marketing/brand presentation

### Launcher icon

For the launcher icon, this patch derives an icon-only crop containing:

- Localsewa blue background
- House
- Tools
- Location pin
- Green road

It intentionally excludes:

- `LocalSewa` wordmark
- `Fast • Trusted • Nearby` tagline

This keeps the icon readable at small Android launcher sizes.

## Android resources included

### Legacy launcher PNGs

Generated for:

- `mipmap-mdpi`
- `mipmap-hdpi`
- `mipmap-xhdpi`
- `mipmap-xxhdpi`
- `mipmap-xxxhdpi`

Files:

- `ic_launcher.png`
- `ic_launcher_round.png`

### Adaptive icon resources

Added:

- `mipmap-anydpi-v26/ic_launcher.xml`
- `mipmap-anydpi-v26/ic_launcher_round.xml`
- density-specific `ic_launcher_foreground.png`
- `@color/ic_launcher_background`

### Native splash

Added:

- Pre-Android 12 `windowBackground` launch screen
- Android 12+ native system splash configuration
- Native splash blue: `#062388`
- Native splash icon: Localsewa launcher artwork

## Files to replace/add

Copy the ZIP contents into the project root and allow matching Android resource
files to be replaced.

Important paths:

```text
android/app/src/main/res/
  values/
    strings.xml
    colors.xml
    styles.xml

  values-v31/
    styles.xml

  drawable/
    localsewa_launch_screen.xml

  drawable-nodpi/
    localsewa_splash_logo.png

  mipmap-anydpi-v26/
    ic_launcher.xml
    ic_launcher_round.xml

  mipmap-mdpi/
  mipmap-hdpi/
  mipmap-xhdpi/
  mipmap-xxhdpi/
  mipmap-xxxhdpi/
```

Also replace:

`src/screens/auth/BrandSplashScreen.tsx`

The React-level splash bridge is shortened to 550 ms so the Android native
splash and React splash do not feel like two long splash screens.

## AndroidManifest

No AndroidManifest replacement is required.

The standard React Native Android manifest already references:

- `@string/app_name`
- `@mipmap/ic_launcher`
- `@mipmap/ic_launcher_round`
- `@style/AppTheme`

so these resources are picked up automatically.

## Dependencies

No npm package is required.

No Gradle dependency is required.

## Installation steps

1. Stop the running app.
2. Copy this ZIP's files into the Localsewa project root.
3. Replace matching resource files when prompted.
4. In Android Studio choose:
   `Build > Clean Project`
5. Then:
   `Build > Rebuild Project`
6. Uninstall the old development app from the Pixel 9 emulator once.
7. Run the app again from Android Studio.

Uninstalling once is recommended because Android launchers can cache old app
icons.

## QA checklist

Verify on Pixel 9 API 36:

1. Launcher label says exactly `Localsewa`.
2. No user-visible `LocalsewaApp` text appears.
3. Launcher icon is the Localsewa icon-only artwork.
4. Round/adaptive masking does not cut off the house/location mark badly.
5. Cold-launch the app from the launcher.
6. Android native splash appears immediately.
7. Native splash transitions into the short Localsewa React brand bridge.
8. Auth Landing opens normally.
9. No white/black startup flash is visible.
10. Login/Register/OTP navigation from v1.5.0 still works.
11. No red-screen or Android resource error appears.

## Notes

Android 12+ controls the system splash presentation and mask. The icon is
therefore intentionally padded to keep important artwork within the adaptive
icon safe region.

The launcher master previews are also included under:

`branding-preview/`

They are documentation/reference files only and are not read by Android.

## Known limitations

- Android 13+ monochrome/themed launcher icon is not custom-designed yet.
- The final session-aware splash duration does not exist yet; the React bridge
  still uses a short fixed timer.
- Inter font is still pending.
- Google Sign-In is still UI-only.
- Authentication is not connected to the backend yet.

## Next milestone — what we will do next

### v1.6.0 — Authentication Backend Integration

After v1.5.1 passes branding QA, we will connect the existing Localsewa backend
to the authentication UI.

Planned work:

1. Rebuild the old API-client idea cleanly.
2. Connect account check.
3. Connect real login.
4. Connect registration OTP request.
5. Connect customer registration.
6. Connect forgot-password OTP.
7. Connect password reset/update.
8. Validate server session on startup.
9. Store sensitive authentication data in secure native storage.
10. Restore the session when the app reopens.
11. Read backend role capabilities.
12. Route Customer accounts to Customer workspace.
13. Route Provider-capable accounts to the correct workspace/role flow.
14. Implement real logout and logout-all handling.
15. Replace temporary auth-preview actions with real API states.
16. Add proper loading, validation, error and retry UX.

Localsewa+ remains a Provider entitlement/tier; it is not a separate login role.
