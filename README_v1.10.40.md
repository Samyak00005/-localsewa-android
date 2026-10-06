# Localsewa Android v1.10.40 — Service Cards & Category Icon System

## Base

Apply over:

`v1.10.39 — Services, Provider & Schedule UI Polish`

This is a focused service-card patch. No booking, provider-details, header,
navigation or backend behavior is changed.

No npm install is required.

## Service card visual update

Old service cards looked too pale and did not complement the Customer accent
green strongly enough.

New card palette:

- default background: `#E4F5EA`
- selected background: `#D8EFDF`
- default border: `#C4E3CF`
- selected border: Customer primary green
- divider: `#CDE6D6`
- service icon: `#2F6B4F`

The approved 4:3 ratio remains unchanged.

## Icon treatment

The old white icon box/container is removed.

The service icon is now fused directly into the card:

- top-right
- 27dp
- dark-but-not-heavy green
- no separate white tile
- service name reserves space so text does not collide with the icon

## Full category icon map

A new dedicated component:

`src/components/customer/ServiceCategoryIcon.tsx`

maps the canonical Localsewa category slug to a service-appropriate Lucide
icon.

The canonical 120 built-in categories are explicitly mapped.

A separate reference file is included:

`SERVICE_ICON_MAP_v1.10.40.md`

## Live/custom categories

The live categories API remains authoritative.

For a category that is not part of the canonical built-in catalog:

1. known custom slugs such as `developer` are mapped explicitly;
2. then a keyword-based fallback is used;
3. final fallback is the neutral Services/Grid icon.

So adding a custom category does not break the card UI.

## Slug-based mapping

Home and All Services now pass:

`category.slug`

to the shared `HomeServiceCard`.

This is more reliable than deciding the icon only from the display name.

## Shared behavior

Because both screens use the same shared card component, the new design applies
to:

- Home -> Popular services
- All Services -> Service categories

## Android version

- versionCode: 11040
- versionName: 1.10.40

## Files added

- `src/components/customer/ServiceCategoryIcon.tsx`
- `SERVICE_ICON_MAP_v1.10.40.md`

## Files replaced

- `src/components/customer/HomeServiceCard.tsx`
- `src/screens/customer/CustomerHomeScreen.tsx`
- `src/screens/customer/CustomerServicesScreen.tsx`
- `android/app/build.gradle`

## Install

Apply over v1.10.39.

No npm install.
No Clean/Rebuild is required for these UI changes.

Normal Android Studio Run is enough.

## QA

Check both Home and All Services:

- cards use the richer light-green background
- cards still use 4:3 ratio
- no LOCAL SERVICES repetition
- icon has no white icon container
- icon feels integrated into the top-right of the card
- icon is dark green but not near-black
- Electrician -> Zap
- Plumber -> Wrench
- Carpenter -> Hammer
- Home Cleaning -> Sparkles
- Dance Teacher -> Music
- Developer -> Laptop
- Aquarium Service -> Fish
- custom/unknown category still gets a safe fallback icon
- selected All Services category still has a stronger green state
