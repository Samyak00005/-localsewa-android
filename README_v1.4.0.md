# Localsewa Android v1.4.0 — Navigation & App Shell

## Summary

This version introduces the first production-oriented navigation architecture
for the fresh Localsewa Android app.

It intentionally uses placeholder page content. The goal of this milestone is
to validate routing, Customer/Provider workspace separation, Provider premium
theme switching and Android back-stack behavior before real screen UI begins.

## Version

`v1.4.0`

## Technology

- React Native 0.87.1
- TypeScript
- React Navigation 7
- Native Stack
- Bottom Tabs
- react-native-screens
- react-native-safe-area-context

React Navigation 7 is intentionally used for this baseline rather than the 8.x
pre-release channel.

## Required npm packages

Open the Android Studio Terminal at the project root and run:

```powershell
npm install @react-navigation/native@^7 @react-navigation/native-stack@^7 @react-navigation/bottom-tabs@^7 react-native-screens react-native-safe-area-context
```

Do not run a separate global install.

## Android native configuration

React Navigation uses `react-native-screens`.

Open your existing:

`android/app/src/main/java/<your-package>/MainActivity.kt`

Do NOT replace the full file.

Add these imports:

```kotlin
import android.os.Bundle
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory
```

Inside `class MainActivity : ReactActivity() { ... }`, add:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
  supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()
  super.onCreate(null)
}
```

A copy of this patch is included at:

`android_patch/MainActivity_addition.kt.txt`

## Navigation architecture

```text
NavigationContainer
└── RootNavigator
    ├── AuthNavigator
    │   └── AuthLanding
    │
    ├── CustomerTabs
    │   ├── Home
    │   ├── Services
    │   ├── Bookings
    │   ├── Saved
    │   └── Profile
    │
    └── ProviderTabs
        ├── Home
        ├── Requests
        ├── Services
        ├── Reviews
        └── Profile
```

## Role model

Core app roles remain:

- Customer/User
- Provider

Localsewa+ is NOT a third role.

```text
Provider
├── STANDARD
└── LOCALSEWA_PLUS
```

The Provider navigation structure remains the same in both modes. The current
tier changes theme and later will control premium entitlements.

## Temporary shell state

`AppShellProvider` is intentionally an in-memory preview state in v1.4.0.

It supports:

- Customer workspace
- Provider Standard workspace
- Provider Localsewa+ workspace
- Temporary Auth preview
- Customer ↔ Provider switching
- Provider Standard ↔ Localsewa+ preview

This is NOT authentication logic.

Real session/auth state will replace it when backend authentication integration
is built.

## Customer bottom navigation

- Home
- Services
- Bookings
- Saved
- Profile

## Provider bottom navigation

- Home
- Requests
- Services
- Reviews
- Profile

No separate Localsewa+ tab structure is created.

## Deep-link preparation

Stable route names and a `localsewa://` linking configuration are included.

Native Android intent-filter configuration is intentionally deferred until the
notification/deep-link milestone, where it can be implemented together with
real booking/chat routes.

## Files

### Replace

- `App.tsx`

### Add

- `src/app/AppShellProvider.tsx`
- `src/navigation/types.ts`
- `src/navigation/linking.ts`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/AuthNavigator.tsx`
- `src/navigation/CustomerTabs.tsx`
- `src/navigation/ProviderTabs.tsx`
- `src/screens/shared/WorkspacePlaceholderScreen.tsx`
- `src/screens/auth/AuthLandingScreen.tsx`
- `src/screens/customer/*`
- `src/screens/provider/*`
- `android_patch/MainActivity_addition.kt.txt`
- `README_v1.4.0.md`

Existing v1.3.0 theme and UI primitive files remain in place.

## Tab icons

The current shell intentionally uses temporary text glyphs such as H, S, B and
P so this milestone does not add an icon dependency only for placeholders.

These are not final icons.

A proper Lucide-compatible icon system will be introduced when production
screen/header/navigation design begins.

## App icon

The real Localsewa launcher icon is not required in this milestone.

Keep it ready. It will be needed when the branded splash/launcher setup is
implemented, before production authentication screens are finalized.

## Test checklist

After installing packages and copying files:

1. Apply the `MainActivity.kt` addition.
2. Gradle Sync.
3. Start Metro.
4. Run the app on Pixel 9 API 36.
5. Confirm Customer workspace opens.
6. Tap all five Customer tabs.
7. Open Customer Profile.
8. Switch to Provider.
9. Tap all five Provider tabs.
10. In Provider Profile, preview Localsewa+.
11. Confirm Provider bottom navigation becomes royal/premium styled.
12. Switch back to Standard Provider.
13. Switch back to Customer.
14. Open Auth Preview.
15. From Auth Preview, enter each workspace.
16. Use Android system Back where applicable.
17. Confirm there is no red-screen runtime error.

## Known limitations

- Screens are placeholders by design.
- Authentication is not connected.
- Backend APIs are not connected.
- Real notification deep links are not active yet.
- Tab icons are temporary.
- App launcher icon/splash is not configured yet.
- Admin is not part of the mobile navigation roadmap.
- Inter font is still pending.

## Next planned milestone

`v1.5.0 — Brand Assets + Splash + Authentication UI Foundation`

Planned work:

- Real Localsewa app icon/brand assets
- Android launcher icon
- Branded splash screen
- Authentication screen shell
- Login UI
- Register UI
- OTP UI
- Forgot-password UI
- role-aware post-auth destination design

Backend authentication will follow after the authentication UI and flows are
approved.
