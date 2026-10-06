# Localsewa Android v1.10.35 — Hero 40% Background Hotfix

## Base

Apply over:

`v1.10.34 — Hero 50% Background & Location Chip Hotfix`

## Change

Only the visual green Home hero background height changed.

Old:

```ts
windowHeight * 0.5
```

New:

```ts
windowHeight * 0.4
```

The hero background is now 40% of the device height.

## Important

No layout values were changed.

The following remain in the exact same positions as v1.10.34:

- location chip
- hero heading
- tagline
- description
- search bar
- three trust/info items
- Popular Services
- all following Home content

Only the green background layer becomes shorter.

## File replaced

- `src/screens/customer/CustomerHomeScreen.tsx`

## Install

1. Keep v1.10.34 as the current baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No Clean/Rebuild required.
5. Normal Android Studio Run is enough.
