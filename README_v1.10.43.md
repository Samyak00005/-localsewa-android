# Localsewa Android v1.10.43 — Provider Profile Card Polish

## Base

Apply over:

`v1.10.42 — Service Card Final Micro-Polish`

This patch only polishes the Customer-facing Provider Details profile card.

No npm install.
No Kotlin/native code changes.

## 1. Business photo gallery cleanup

The approved 16:9 business gallery remains.

Changes:

- gallery still has 12dp inset from the profile card
- all 4 gallery corners remain rounded at 18dp
- subtle gallery border added
- expand control reduced from 34dp to 30dp
- business-photo dots removed
- only the compact `1 / N` counter remains for multiple photos

The image itself is now the visual focus instead of multiple overlay controls.

Full-screen image viewer and horizontal swipe are unchanged.

## 2. Verified badge removed

The `VERIFIED` badge is completely removed from Provider Details.

Its top-right position now shows real availability:

- green dot + `Available`
- grey dot + `Unavailable`

The old duplicate availability line under location is removed.

Backend verification state is not deleted; it is simply not shown on this page.

## 3. Profile-card vertical spacing tightened

Reduced spacing:

- profile identity -> Rating / Reviews / Experience cards
- stats -> About divider
- About divider -> About heading
- About heading -> About text

Profile-body vertical padding is also slightly reduced.

The goal is to remove the large empty vertical gaps visible in the supplied
screen while preserving readability.

## 4. Correct nested radius formula

The business gallery uses:

- inner/gallery radius = 18dp
- inset/padding = 12dp

Therefore the outer profile card now uses:

`18 + 12 = 30dp`

So:

`outer radius = inner radius + inset`

This produces a mathematically consistent nested rounded-card shape.

## Android version

- versionCode: 11043
- versionName: 1.10.43

## Files replaced

- `src/screens/customer/ProviderDetailsScreen.tsx`
- `android/app/build.gradle`

## Install

Apply over v1.10.42.

No npm install.
No Clean/Rebuild required for the React Native UI change.

Normal Android Studio Run is enough.

## QA

Provider Details:

- business gallery looks cleaner
- no dots over business photo
- `1 / N` remains when multiple images exist
- image still opens full-screen
- VERIFIED is gone
- Available/Unavailable appears at top-right beside provider name
- no duplicate availability row below location
- Rating/Reviews/Experience sits closer to profile identity
- About sits closer to stats
- outer profile-card radius visually matches the inset 18dp gallery radius
