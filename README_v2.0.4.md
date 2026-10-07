# Localsewa Android v2.0.4 — Provider Profile Composition Hotfix

Incremental hotfix only. Apply over the v2.0.3 source.

## Changes

- Business-photo carousel is integrated inside the main Provider profile card instead of using a separate outer card.
- `Available for work` is now its own standalone card immediately below the profile card.
- Localsewa+ providers receive a medium premium-gold ring around the profile photo. The ring follows entitlement, not the optional theme preference.
- Removed the Plus/Standard pill from the Provider header.
- Removed the Localsewa+ badge beside the business name and replaced it with live `AVAILABLE` / `UNAVAILABLE` status.
- The `Localsewa+ Provider` entitlement card always retains its premium ivory/gold treatment even when the user turns the optional Localsewa+ theme off.
- Main Provider Profile cards now use the same 28dp corner radius as the profile card for smoother, consistent card geometry: availability, membership, appearance, and Provider workspace cards.
- Customer screens/components are not changed by this patch.

## Version

- versionName: `2.0.4`
- versionCode: `20004`

## Files in this hotfix

- `src/screens/provider/ProviderProfileScreen.tsx`
- `src/components/provider/ProviderHeader.tsx`
- `android/app/build.gradle`
- `README_v2.0.4.md`
