# Localsewa Android v1.10.33 — Search, Location & Hero Refinement

## Base

Apply over:

`v1.10.32 — Category Navigation & Hero Refinement`

No npm install.
No Android/Kotlin changes.

---

## 1. Services Near You now uses the exact same location chip as Home

A shared component is introduced:

`CustomerLocationChip`

It is now used by:

- Home hero
- Services Near You

The old large Service Area row/card on Services Near You is removed.

The location chip shows:

- location pin
- saved location
- down chevron

The whole chip is clickable and opens the existing Default Location bottom
sheet.

Because Home and Services Near You now use the same component, future visual
changes to the chip remain consistent automatically.

---

## 2. Home search no longer renders Search Results on Home

Old behavior:

- type `Electrician`
- Home sections disappear
- `Search results` + provider cards render inside Home

New behavior:

- typing only updates the Home search field
- Home remains Home
- tap the green Search button OR Android keyboard Search
- a dedicated `Search results` page opens

New route:

`ProviderSearchResults`

The new Search Results page includes:

- Customer green header
- search bar
- submitted search query
- real backend provider search using the existing `q` parameter
- saved/default location coordinates when available
- matching provider count
- shared HomeProviderCard
- Details
- Save / Saved
- Book
- Home active in the bottom navigation

Searches on the results page are also submit-based, so typing does not
continuously replace the provider request until Search is pressed.

---

## 3. Home category navigation remains dedicated

Popular service cards continue using the v1.10.32 dedicated category route:

`ServiceCategoryProviders`

Therefore:

- Electrician -> Electrician providers page
- Developer -> Developer providers page
- etc.

Category cards do not convert Home into a search-results page.

---

## 4. Home hero is rebalanced

The green hero is now an adaptive contained section rather than an overlapping
layout.

Main changes:

- shared location chip at top
- tighter but readable spacing above the title
- title slightly reduced for better balance
- compact tagline spacing
- compact supporting text
- controlled space above search
- controlled space between search and the three trust items
- 16dp bottom breathing room after the trust items
- Popular Services no longer overlaps the green hero
- a visible 12dp separation now exists between the hero and Popular Services

Hero uses an adaptive minimum height based on the device viewport:

- target: approximately 34% of the screen height for the hero body
- clamped to roughly 260–286dp

This keeps the total green header + hero around a sensible proportion of common
phone screens without forcing clipping. If accessibility text needs more room,
the hero is still allowed to grow naturally.

---

## Files added

- `src/components/customer/CustomerLocationChip.tsx`
- `src/screens/customer/ProviderSearchResultsScreen.tsx`

## Files replaced

- `src/components/customer/index.ts`
- `src/screens/customer/CustomerHomeScreen.tsx`
- `src/screens/customer/CustomerNearbyServicesScreen.tsx`
- `src/screens/customer/index.ts`
- `src/navigation/CustomerNavigator.tsx`
- `src/navigation/types.ts`

---

## Install

1. Keep v1.10.32 as the current working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No Clean/Rebuild required.
5. Normal Android Studio Run is enough.

---

## QA

### Services Near You

Confirm:

- old large location box is gone
- location UI matches the Home chip
- complete chip is clickable
- tap opens Default Location popup

### Home Search

Type:

`Electrician`

Before pressing Search:

- Home must remain Home
- Popular Services must remain visible
- Services Near You must remain the normal 3-provider preview

Then press the green Search button:

- dedicated Search Results page opens
- Home must not render Search Results inline

Repeat with Android keyboard Search.

### Search Results page

Confirm:

- search query appears in the field
- correct provider results load
- another search can be submitted
- Details works
- Save / Saved works
- Book works
- Back returns to Home

### Hero

Confirm:

- green hero feels balanced
- location chip is not surrounded by excessive vertical empty space
- search + three trust items have breathing room below them
- Popular Services starts after a clear gap
- Popular Services does not overlap the green hero
- all hero content remains inside the green section
