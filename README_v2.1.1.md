# Localsewa Android v2.1.1 — Provider Dashboard Refinement Hotfix

Base: v2.1.0 Provider Dashboard Feature Patch.

This is an incremental hotfix. Apply it over the current v2.1.0 source by overwriting the included files.

## Provider Dashboard refinements

- Business Overview hierarchy softened without changing its structure.
- Added a small request-time icon treatment in the Business Overview footer.
- Availability pill made slightly more compact.
- Four top stat cards made shorter and denser while preserving the 2x2 layout.
- Empty "Needs attention" state collapsed into a slim caught-up row.
- Fixed Active Work date/time metadata layout so the text no longer collapses beside the icons.
- Dashboard dates now display as `27 Sep 2026` style text.
- Dashboard times now display as `2:30 PM` style text.
- Business Performance no longer repeats Rating and Completed Jobs from the top stats.
- Business Performance now shows Reviews, Services, Experience, and Availability.
- Quick Actions made slightly more compact; labels shortened to avoid wrapping.
- Localsewa+ membership copy is trial-aware:
  - `Localsewa+ Trial` + `Monthly plan • Trial active`
  - `Localsewa+ Active` + plan/membership state for paid active entitlement.
- Recent Activity uses human-readable dates and tighter rows.
- Section spacing reduced slightly to lower overall Dashboard height without removing content.

## Unchanged

- Locked v2.0.17 Customer / Provider / Localsewa+ palette.
- Provider backend contracts and API routes.
- Dashboard refresh strategy (pull-to-refresh, focus refresh, request-count polling).
- Provider booking status rules.
- Customer UI.
- Requests lifecycle actions remain reserved for the dedicated Requests / Request Details milestone.

## Version

- versionName: 2.1.1
- versionCode: 20101

## Files in this patch

- `src/screens/provider/ProviderHomeScreen.tsx`
- `android/app/build.gradle`
- `README_v2.1.1.md`
