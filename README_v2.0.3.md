# Localsewa Android v2.0.3 — Provider Profile UX Hotfix

Base: **v2.0.2**
Delivery: **incremental hotfix only**

## Changes

1. Provider business photo area redesigned as a clean Customer-style 16:9 card/carousel.
   - No Business photos heading/subheading restored.
   - Cover badge retained.
   - Swipe paging added.
   - Current photo count shown when more than one image exists.
   - Tap still opens the existing fullscreen photo viewer.

2. Business email removed from Edit business profile.
   - Field removed from the edit modal.
   - Email validation removed from this flow.
   - `business_email` removed from the Provider profile update request payload so this screen cannot overwrite it.

3. `Available for work` moved below the About section inside the business identity card.

4. `Switch to Customer` now uses the light tinted card-style treatment requested, using the locked Provider palette (`subtle` / `secondary`) rather than introducing a new color system.

5. Localsewa+ appearance control changed to a proper ON/OFF switch.
   - ON = Localsewa+ premium visual accents.
   - OFF = normal Provider emerald colors.
   - Localsewa+ membership and benefits remain active in both states.
   - Existing per-user theme preference persistence from v2.0.2 remains unchanged.

## Version

- Android `versionCode`: `20003`
- Android `versionName`: `2.0.3`

## Changed files

- `android/app/build.gradle`
- `src/screens/provider/ProviderProfileScreen.tsx`
- `src/types/providerWorkspace.ts`
- `src/api/providerWorkspaceApi.ts`

## Apply

Copy these files over the corresponding files in the **v2.0.2 source**.
No Customer screen/component files are included or modified by this hotfix.
