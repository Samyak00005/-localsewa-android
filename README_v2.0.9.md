# Localsewa Android v2.0.9 — Provider Switch-to-Customer Background Hotfix

Apply this patch on top of **v2.0.8**.

## Changes
- Keeps the existing compact Provider `Switch to Customer` button/row layout unchanged.
- Replaces only its background treatment with the light Customer-theme card language from the supplied reference.
- Uses a pale customer-green base plus large, soft translucent circular background shapes.
- Does not add promo copy, CTA pills, extra icon blocks, or any new switching behavior.
- Existing `enterCustomer` workspace-switch logic is unchanged.

## Files
- `src/screens/provider/ProviderProfileScreen.tsx`
- `android/app/build.gradle`

Version: `2.0.9` / `versionCode 20009`.
