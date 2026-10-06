# Localsewa Android v1.10.44 — Provider Gallery & Service Numbering

## Base

Apply over:

`v1.10.43 — Provider Profile Card Polish`

Focused Provider Details patch only.

No npm install.
No Kotlin/native changes.

## 1. Business gallery right-side margin fix

The previous gallery slide width was calculated from the whole device width.

That could differ from the actual nested profile-card/gallery width and created
an oversized empty area on the right side.

Now the gallery measures its own rendered width with `onLayout`.

Each horizontal gallery page uses that exact measured width.

Result:

- left and right inset visually match
- no oversized right-side gap
- 16:9 gallery remains
- 18dp gallery radius remains
- swipe/paging remains
- 1 / N counter remains
- full-screen viewer remains

## 2. Service serial numbers

Each published provider service now receives a small serial number:

`1`
`2`
`3`
...

The number is shown in a compact circular light-green marker before the service
name.

The rows remain non-clickable and still use divider lines rather than
individual service cards.

## Android version

- versionCode: 11044
- versionName: 1.10.44

## Files replaced

- `src/screens/customer/ProviderDetailsScreen.tsx`
- `android/app/build.gradle`

## Install

Apply over v1.10.43.

No npm install.
No Clean/Rebuild required.

Normal Android Studio Run is enough.

## QA

Provider Details:

- business image has visually equal left/right inset
- no extra white gap on the right
- gallery still swipes correctly through all business photos
- service rows show 1, 2, 3... in order
- service name, description and price remain aligned
- divider remains between service rows
