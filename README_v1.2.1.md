# Localsewa Android v1.2.1 — Provider Color Hotfix

## Summary

This patch changes only the Provider Standard color family.

The previous v1.2.0 provider pine/petrol palette was replaced with the darker
forest-green shade taken directly from the approved Provider UI reference image.

## Approved reference colors

The dominant dark green in the supplied Provider UI image is:

- RGB: `14, 48, 36`
- HEX: `#0E3024`

The supporting provider-card green in the same reference is:

- RGB: `33, 64, 53`
- HEX: `#214035`

## Updated Provider Standard palette

- Text: `#101B1A`
- Background: `#F4F7F6`
- Primary: `#0E3024`
- Secondary: `#D7E3DF`
- Accent: `#214035`

Supporting interaction colors:

- Primary pressed: `#09271D`
- Subtle provider surface: `#EEF4F1`

## Unchanged

The following are unchanged from v1.2.0:

- Customer palette
- Localsewa+ premium palette
- Typography
- Spacing
- Radius
- Theme architecture
- Status/semantic colors
- Foundation screen layout

## Files included

- `src/theme/colors.ts`
- `README_v1.2.1.md`

## Installation

Replace:

`src/theme/colors.ts`

with the version in this ZIP.

No npm packages or Gradle changes are required.

Fast Refresh should apply the update automatically. If not, stop and run the app again.

## Next milestone

After final palette approval:

`v1.3.0` — reusable shadcn-style React Native UI primitives.
