# Localsewa Android v2.0.14 — Services Info Card + Provider Blur Polish Hotfix

Apply this hotfix on top of v2.0.13.

## Changes

### Provider Services
- Refined the top Business Category information card without changing the Services page structure.
- Uses the existing Provider subtle/secondary emerald surfaces so the card is visually distinct from individual service cards.
- Category hierarchy is now clearer: small `BUSINESS CATEGORY` label with the actual category as the prominent value.
- Category icon tile increased from 46dp to 56dp and icon from 20dp to 24dp.
- Existing category-change behavior and Localsewa+ entitlement rules are unchanged.
- Service list, Add Service CTA, Edit/Remove actions, prices, descriptions, and bottom-sheet behavior are unchanged.

### Provider media/popup blur
- Increased the existing Provider overlay background blur from 7 to 11.
- Overlay content remains sharp; only the underlying Provider workspace is blurred.
- No new blur dependency was added.

## Version
- versionName: 2.0.14
- versionCode: 20014

## Patch files
- `src/screens/provider/ProviderServicesScreen.tsx`
- `src/components/provider/ProviderOverlayBlur.tsx`
- `android/app/build.gradle`
- `README_v2.0.14.md`
