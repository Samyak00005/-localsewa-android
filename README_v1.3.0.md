# Localsewa Android v1.3.0 — UI Component Foundation

## Summary

This version introduces the first reusable UI primitive layer for the fresh
Localsewa React Native Android application.

The goal is to stop individual screens from hardcoding typography, colors,
spacing, button styles, loading states and common controls.

All components consume the active role theme through a shared `ThemeProvider`.

## Version

`v1.3.0`

## What changed

### Theme runtime

Added:

- `ThemeProvider`
- `useAppTheme()`
- Runtime theme switching between:
  - Customer
  - Provider Standard
  - Provider Localsewa+

Components now read role-specific colors from the theme instead of receiving
hardcoded green/premium colors from screens.

### UI primitives added

- `AppText`
- `Button`
- `IconButton`
- `Card`
- `Input`
- `Badge`
- `Avatar`
- `AppSwitch`
- `Divider`
- `Spinner`
- `Skeleton`

### Showcase screen

Added `ComponentShowcaseScreen` to test every primitive across all three role
themes before these components are used in production screens.

## Files included

### Replace

- `App.tsx`
- `src/theme/index.ts`

### Add

- `src/theme/ThemeProvider.tsx`
- `src/components/ui/AppText.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Avatar.tsx`
- `src/components/ui/AppSwitch.tsx`
- `src/components/ui/Divider.tsx`
- `src/components/ui/Spinner.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/index.ts`
- `src/screens/foundation/ComponentShowcaseScreen.tsx`
- `README_v1.3.0.md`

## Dependencies

No new npm dependency is required for this version.

It uses React Native primitives and the already installed
`react-native-safe-area-context`.

## Design behavior

### Button variants

- Primary
- Secondary
- Outline
- Ghost
- Destructive
- Loading
- Disabled support

### Badge variants

- Default
- Success
- Warning
- Error
- Info
- Premium

### Input states

- Default
- Helper text
- Error
- Disabled support

### Loading states

- Spinner
- Animated Skeleton

## Important design rules

1. No Customer/Provider/Premium hex colors should be hardcoded in future
   production screens.
2. Screens should consume shared UI primitives wherever an appropriate
   primitive already exists.
3. Role identity comes from the theme layer.
4. Booking/payment/system state colors remain semantic and independent from
   role identity.
5. Provider Standard and Provider Localsewa+ share the same component
   architecture.
6. Localsewa+ is a Provider entitlement/theme, not a third navigation role.
7. Minimum primary control height is 48dp.
8. This is a mobile-native component system; web shadcn/ui DOM components are
   not being copied into React Native.

## Known limitations

- Inter is not installed yet. Current typography uses the Android/system font.
- Real icons are not installed yet; `IconButton` accepts any ReactNode and the
  showcase uses temporary text content.
- No navigation stack has been added.
- No backend/API integration is part of this version.
- Component variants will expand as real screens expose additional needs.
- Gradient support is intentionally deferred until a real screen needs it.

## Test checklist

After copying the files:

1. Build/run the app.
2. Confirm the `UI Component Foundation` screen opens.
3. Switch between Customer, Provider and Localsewa+.
4. Confirm buttons recolor according to the active theme.
5. Confirm inputs display normal and error states.
6. Confirm all badge variants render.
7. Toggle `Available for work`.
8. Confirm Spinner and Skeleton animate.
9. Confirm there are no red-screen runtime errors.

## Next planned milestone

`v1.4.0 — Navigation & App Shell`

Planned work:

- React Navigation foundation
- Root navigator
- Auth stack placeholder
- Customer workspace shell
- Provider workspace shell
- Customer bottom navigation
- Provider bottom navigation
- Role-aware routing foundation
- Deep-link-ready navigation structure

Authentication UI begins after the navigation/app-shell layer is stable.
