# Localsewa Android v1.10.34 — Hero 50% Background & Location Chip Hotfix

## Base

Apply over:

`v1.10.33 — Search, Location & Hero Refinement`

No npm install.
No Android/Kotlin changes.

## 1. Home green background = 50% of device height

The green hero background is now an independent absolute visual layer:

`windowHeight * 0.50`

Important: this layer does NOT participate in layout.

Therefore the following keep the same positions and spacing from v1.10.33:

- location chip
- hero heading
- trusted-help tagline
- description
- search bar
- three trust/info items
- Popular Services
- all following Home content

The existing `heroMinHeight` calculation is intentionally preserved for the
content layout. Only the visual green background height is changed.

This makes future background experiments easy:

```ts
const heroBackgroundHeight = Math.round(
  windowHeight * 0.5,
);
```

Change `0.5` only when you want another background percentage.

## 2. Location chip lightened

Old pill:

`#0B7643`

New pill:

`rgba(255,255,255,0.12)`

with a slightly clearer translucent white border.

Text and icons remain white.

This keeps the chip readable while making it feel integrated with the hero
instead of looking like a separate dark-green block.

## Files replaced

- `src/screens/customer/CustomerHomeScreen.tsx`
- `src/components/customer/CustomerLocationChip.tsx`

## Install

1. Keep v1.10.33 as the current working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No Clean/Rebuild required.
5. Normal Android Studio Run is enough.

## QA

Confirm:

- green background visually extends to 50% of the device height
- hero text/components did not shift
- Search / trust items retain their old positions
- Popular Services retains its old position
- location pill is visibly lighter
- location chip remains readable and clickable
