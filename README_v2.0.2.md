# Localsewa Android v2.0.2 — Provider Profile Layout + Theme Choice Hotfix

Baseline: v2.0.1 Locked Provider Design System Hotfix.

This is an incremental hotfix. Apply only the files included in the hotfix ZIP over the current v2.0.1 source.

## Changes

- Removed the Provider Profile page title and subtitle from the top of the screen.
- Moved the existing business-photo gallery to the top of Provider Profile.
- Removed the `Business photos` heading, explanatory subtitle, and standalone photo-count heading row so the gallery starts directly at the top content area.
- Localsewa+ providers now get an `Appearance` option in Profile.
- The option shows `Switch to normal theme` while Localsewa+ premium visuals are active.
- After switching to normal theme, the same option becomes `Switch to Localsewa+ theme`, so the choice is reversible.
- Theme choice changes visuals only. Localsewa+ membership and entitlement remain active.
- Normal theme uses the locked Provider Standard dark-emerald palette.
- Localsewa+ theme keeps the same Provider base UI and restores only the approved premium accent surfaces/indicators.
- Provider header Plus indicator, Profile Plus badge/membership card, and Provider placeholder Plus badges respect the selected visual theme.
- Provider theme preference is persisted per signed-in user on the device using the already-installed `react-native-keychain` dependency. No backend API or new package is required.
- Customer screen/component files are unchanged.

## Android version

- `versionCode 20002`
- `versionName 2.0.2`

## Files in this hotfix

- `android/app/build.gradle`
- `src/app/AppShellProvider.tsx`
- `src/app/providerThemePreference.ts`
- `src/components/provider/ProviderHeader.tsx`
- `src/screens/provider/ProviderHomeScreen.tsx`
- `src/screens/provider/ProviderProfileScreen.tsx`
- `src/screens/provider/ProviderRequestsScreen.tsx`
- `src/screens/provider/ProviderServicesScreen.tsx`
- `src/screens/shared/WorkspacePlaceholderScreen.tsx`
- `README_v2.0.2.md`
