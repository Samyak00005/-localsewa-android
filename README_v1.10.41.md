# Localsewa Android v1.10.41 — Service Card Navigation & Visual Polish

## Base

Apply over:

`v1.10.40 — Service Cards & Category Icon System`

This is a focused service-card/navigation patch.

No npm install.
No native Android/Kotlin source changes.

## 1. All Services category cards now navigate directly

Old behavior:

`Tap Electrician -> stay on All Services -> provider list below gets filtered`

This has been removed.

New behavior:

`Tap Electrician -> ServiceCategoryProviders -> Electrician provider list`

The same direct-navigation model now applies consistently from:

- Home Popular Services
- All Services Service Categories

The old selected-category chip and selected-category filtering state are removed
from All Services.

Search on All Services can still filter/search the current directory normally,
but category-card taps always leave the page and open the dedicated provider
list.

## 2. Service icon moved into the right half of the card

The icon is no longer pinned to the top-right corner.

New treatment:

- visually centered in the upper/middle right half
- 30dp service icon
- dark green `#2E684D`
- no white icon tile
- no button-like container
- category title remains on the left

This creates a stronger left-text / right-icon composition.

## 3. Lighter creative card surface

The dark/pale solid-green card is replaced with a layered light treatment.

Default:

- base: `#F7FCF9`
- border: `#D4E9DB`
- right-side soft shape: `#E6F5EB`
- subtle right-side ring
- divider: `#DDEDE3`

Selected-state support remains available for future uses:

- selected base: `#EFF9F2`
- selected shape: `#D9F0E1`
- selected border: `#90CFA8`

The surface is intentionally not one flat solid color. It uses two subtle
decorative layers on the right side to make the cards feel more designed while
remaining light enough to match Localsewa Customer green.

## Icon mapping

The complete v1.10.40 category -> icon mapping remains unchanged.

## Android version

- versionCode: 11041
- versionName: 1.10.41

## Files replaced

- `src/components/customer/HomeServiceCard.tsx`
- `src/screens/customer/CustomerServicesScreen.tsx`
- `android/app/build.gradle`

## Install

Apply over v1.10.40.

No npm install.
No Clean/Rebuild required.

Normal Android Studio Run is enough.

## QA

All Services:

1. Tap Dance Teacher.
   - must immediately open Dance Teacher provider-list page
   - must NOT create a Dance Teacher chip on All Services
   - must NOT filter provider cards at the bottom of All Services

2. Repeat with Developer / Electrician / Aquarium Service.

3. Check service cards:
   - noticeably lighter than v1.10.40
   - subtle layered right-side background
   - icon visually sits in right half, not top corner
   - category name remains easy to scan
   - provider count and arrow remain clear
   - 4:3 ratio remains unchanged

Home:

- Popular Services uses the same updated visual card automatically.
