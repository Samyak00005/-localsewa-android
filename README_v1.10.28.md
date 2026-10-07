# Localsewa Android v1.10.28 — Home, Nearby & Location Refinement

## Base

Apply over `v1.10.27 — Deletion & Notifications Refinement`.

No npm package is added in this patch.
No Android/Kotlin file is changed.

## Fixes included

### 1. Home Save bug

The Android parser now prefers the backend's public provider reference:

`provider_ref`

and normalizes a numeric provider profile ID to the required public format:

`provider-<profile-id>`

before provider details, Save and Unsave calls.

This addresses the Home-card failure where `/saved` could receive a numeric ID
and the backend returned `Provider not found.`

The backend contract is unchanged. Localsewa provider refs are still public refs
such as `provider-12`, not user IDs or service IDs.

### 2. Customer sidebar removed

Customer role no longer shows:

- Hamburger icon
- Customer sidebar/drawer

The Bell notification action remains in the Customer header.

The old sidebar source file is intentionally not physically deleted in this
patch; it is simply no longer connected to `CustomerHeader`. This avoids another
unnecessary compatibility regression while removing it completely from the UI.

### 3. Dedicated Services Near You page

Home `Services near you -> See all` no longer redirects to All Services.

A dedicated stack page is added:

`NearbyServices`

It includes:

- Customer header
- saved service area
- Change location
- shared Customer search bar
- providers ordered by availability, approximate distance and rating
- Details / Save / Book actions
- loading / error / empty states
- Customer bottom navigation

All Services remains the category/directory page and is no longer used as the
Services Near You destination.

### 4. Popular Services cards

Home popular-service cards now use `aspectRatio: 1` so Electrician, Home
Cleaning, Dance Teacher, Developer, Plumber and Carpenter render as square
2-column cards rather than wide rectangles.

### 5. Location UI redesign

Default Location keeps the real existing manual verification/save backend flow,
but its presentation now matches the supplied design:

- bottom-aligned sheet, not centered
- small equal side/bottom margin
- `SERVICE AREA` overline
- `Set your location` title
- verified-India guidance
- Current Location visual card
- OpenStreetMap attribution
- `OR ENTER MANUALLY` divider
- City, area or PIN code search-style input
- Verify + Save actions

Important: this patch does **not** claim Android GPS capture is wired. The
Current Location card is the requested visual entry point; the existing verified
manual location flow remains the functional source of truth in this patch.
Native GPS wiring can be added separately without blocking this UI refinement.

## Files changed

- `src/api/providerApi.ts`
- `src/api/customerApi.ts`
- `src/components/navigation/CustomerHeader.tsx`
- `src/components/customer/HomeServiceCard.tsx`
- `src/screens/customer/CustomerHomeScreen.tsx`
- `src/screens/customer/CustomerNearbyServicesScreen.tsx` (new)
- `src/screens/customer/DefaultLocationScreen.tsx`
- `src/screens/customer/index.ts`
- `src/navigation/types.ts`
- `src/navigation/CustomerNavigator.tsx`

## Install

1. Keep v1.10.27 as the current project.
2. Copy/replace this ZIP into `LocalsewaApp`.
3. No npm install.
4. Since this patch is TypeScript-only, normal Android Studio Run is enough.

## QA

- Home -> Save on several providers; no `Provider not found` alert
- Saved status refreshes after save
- Unsave still works
- Hamburger is absent on every Customer page
- Bell remains functional
- Home -> Services near you -> See all opens dedicated Nearby page
- Nearby Details / Save / Book work
- Popular Services cards are square and remain two columns
- Location popup opens from Home/Profile/Nearby
- Location sheet sits at the bottom
- manual city/area/PIN verification + Save still works

## Next

Continue with the user's remaining Customer UI/bug list. Customer freeze remains
on hold until explicit approval.
