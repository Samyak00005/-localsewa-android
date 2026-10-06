# Localsewa Android v1.10.42 — Service Card Final Micro-Polish

## Base

Apply over:

`v1.10.41 — Service Card Navigation & Visual Polish`

This is a focused service-card visual patch only.

No npm install.
No Kotlin/native module changes.

## Changes

### 1. Larger service icons

Service category icons increase from:

`30dp -> 35dp`

The icon remains line-based and uses a balanced dark Localsewa green:

`#2B6549`

### 2. Icon centered on the right side

The icon is now vertically centered in the right side of the card.

It is no longer visually biased toward the top.

This creates a clearer two-part composition:

- left = service/category name
- right = category icon

### 3. Slightly darker base card

Previous default:

`#F7FCF9`

New default:

`#EDF8F1`

Selected:

`#E2F3E7`

This is darker than v1.10.41 but still intentionally light enough to keep the
All Services grid airy.

### 4. Decorative shape reduced and softened

The right-side decorative circle/blob is now:

- smaller
- centered around the icon
- lower opacity
- no longer extends aggressively toward the footer

Default decorative shape:

`#DCEFE3`

with reduced opacity.

### 5. Decorative ring softened

The secondary ring is smaller and lower-opacity so the service icon is the
main visual focus.

### 6. `Available soon` readability

The unavailable-provider label now uses:

`#667A6F`

instead of the lighter generic muted text.

It remains visually secondary while being easier to read.

## Unchanged

- 4:3 service card ratio
- two-column grid
- complete 120-category icon mapping
- category tap -> dedicated provider-list page
- provider count footer
- arrow
- Home and All Services share the same card component

## Android version

- versionCode: 11042
- versionName: 1.10.42

## Files replaced

- `src/components/customer/HomeServiceCard.tsx`
- `android/app/build.gradle`

## Install

Apply over v1.10.41.

No npm install.
No Clean/Rebuild required for the UI code.

Normal Android Studio Run is enough.

## QA

Check both Home Popular Services and All Services:

- icon is visibly larger
- icon sits vertically centered on the right
- base card is slightly darker than v1.10.41
- card still feels light, not dull/heavy
- decorative shape is subtle
- decorative shape does not dominate the footer
- Available soon is easier to read
- category tap still opens its dedicated provider-list page
