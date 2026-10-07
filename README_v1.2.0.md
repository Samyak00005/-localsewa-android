# Localsewa Android v1.2.0 — Theme Refinement

## Summary

This version refines the role-based visual identity before reusable UI components are built.

The Customer palette remains intentionally light and approachable.
The Provider Standard palette is now darker, more professional, and shifted from ordinary green toward a deep pine/petrol direction.
The Provider Localsewa+ palette has been redesigned to feel visibly royal and premium rather than subtle.

## Version

`v1.2.0`

This project now follows three-part semantic versioning for all future delivered builds.

## Files included

- `src/theme/colors.ts`
- `src/theme/themes.ts`
- `src/screens/foundation/FoundationScreen.tsx`
- `README_v1.2.0.md`

## Replace these files

Copy the first three files into the matching project paths and replace the existing versions.

No new npm package is required.

## Core 5-color palettes

### Customer

- Text: `#102018`
- Background: `#F7FAF8`
- Primary: `#0F8449`
- Secondary: `#DCEFE4`
- Accent: `#20A85A`

Direction: light, friendly, accessible and service-oriented.

### Provider Standard

- Text: `#101B1A`
- Background: `#F4F7F6`
- Primary: `#123F3A`
- Secondary: `#D6E3E0`
- Accent: `#2F6F68`

Direction: deep pine / petrol, more professional and visually distinct from Customer mode.

### Provider Localsewa+

- Text: `#111420`
- Background: `#FBF7EE`
- Primary: `#123C35`
- Secondary: `#4A2F63`
- Accent: `#D4AF57`

Direction: deep emerald + royal aubergine + champagne gold.

Premium-specific supporting tokens:

- Deep Emerald: `#0C2D28`
- Deep Aubergine: `#322044`
- Strong Gold: `#B88A2B`
- Soft Gold: `#F7E8BE`
- Premium Ivory Surface: `#FFFDF8`

## Design rules introduced

1. Customer and Provider Standard must not look like the same green theme at different brightness levels.
2. Provider Standard uses a darker pine/petrol visual identity.
3. Localsewa+ may use richer royal surfaces, gold accents and stronger contrast.
4. Gold is reserved for premium entitlement, rank, highlights and special actions. It is not a generic button color.
5. Booking states such as success, warning, error and info remain semantic colors and are not replaced by role-brand colors.
6. The same screen/component architecture is retained for Provider Standard and Localsewa+; premium mode changes theme and entitlement, not the core role.

## Compatibility

Backward-compatible color aliases are preserved in `colors.ts` so Fast Refresh cannot reproduce the earlier mixed-theme crash while files are being replaced.

## Known limitations

- The actual Inter font is not installed yet.
- Reusable UI primitives have not been built yet.
- No navigation or backend work is part of this version.
- The premium preview uses layered native surfaces rather than a gradient because no gradient dependency has been added yet.

## Next milestone

`v1.3.0` — Reusable UI primitives

Planned initial components:

- Text
- Button
- IconButton
- Card
- Input
- Badge
- Avatar
- Switch
- Skeleton
- Spinner
