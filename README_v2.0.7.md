# Localsewa Android v2.0.7 — Customer Provider Switch Card Hotfix

Base: v2.0.6

## Changes

- Moved the Customer Profile `Switch to Provider` workspace action above `App settings`.
- Replaced the old plain Provider workspace menu row with a dedicated Customer-green promotional switch surface inspired by the existing Emergency Services card treatment:
  - full green surface
  - translucent decorative circles/glow layers
  - business/workspace icon block
  - white CTA pill with arrow
  - preserved locked Customer palette and existing typography/spacing conventions
- Kept the existing `enterProvider()` behavior unchanged, so the current workspace transition flow still handles the actual role switch.
- No Provider Profile/Reviews UI changes in this patch.

## Version

- versionName: 2.0.7
- versionCode: 20007

## Apply

Overwrite these files on top of the current v2.0.6 source:

- `src/screens/customer/CustomerProfileScreen.tsx`
- `android/app/build.gradle`
