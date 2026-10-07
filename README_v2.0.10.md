# Localsewa Android v2.0.10 — Provider Switch-to-Customer Row Polish Hotfix

Apply this patch on top of **v2.0.9**.

## Changes
- Keeps the existing light Customer-theme decorative background for `Switch to Customer`.
- Restores the foreground to the same row grammar used by `My services` and `Reviews`:
  - left customer/user icon tile
  - `Switch to Customer` title
  - short secondary description
  - right chevron
- Uses the same 28dp smooth major-card radius used across the current Provider Profile surfaces.
- Existing `enterCustomer` workspace-switch logic is unchanged.
- No Customer screens/components are included in this patch.

## Files
- `src/screens/provider/ProviderProfileScreen.tsx`
- `android/app/build.gradle`

Version: `2.0.10` / `versionCode 20010`.
