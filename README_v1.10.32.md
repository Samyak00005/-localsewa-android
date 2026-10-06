# Localsewa Android v1.10.32 — Category Navigation & Hero Refinement

## Base

Apply over:

`v1.10.31 — All Services UI Polish`

No npm install.
No Android/Kotlin changes.

---

## 1. Home category cards no longer turn Home into a result page

Previously:

`Home -> Popular service card -> Home search state`

This caused Home itself to transform into `Search results`, which made the
navigation model unclear.

Now:

`Home -> Popular service card -> dedicated service-category providers page`

Example:

`Electrician -> Electrician providers`

The new screen uses:

- green Customer header
- category title
- provider search
- real category-filtered provider API request
- shared HomeProviderCard
- Details
- Save / Saved
- Book
- All services active in bottom navigation

Android system back returns to Home.

---

## 2. Services Near You location selector is compact

The large service-area card and separate Change Location button are removed.

It is replaced by one compact clickable row:

`[ location icon ] Service area / saved location [ > ]`

The complete row opens the existing Default Location bottom sheet.

This preserves the current real location flow while reducing wasted vertical
space.

---

## 3. Home green hero is shorter

The Home hero has been tightened so it occupies substantially less of the
visible device height on normal Android phone layouts.

Changes:

- smaller top padding above location
- location chip reduced from 36dp to 32dp minimum height
- less space between location and heading
- heading reduced slightly
- trust tagline spacing reduced
- supporting description shortened without changing meaning
- description typography tightened
- less space above search
- less space above trust-benefit row
- smaller hero bottom padding
- Popular Services overlap reduced from 22dp to 16dp

All hero components remain inside the green hero section.

No fixed clipping height is used, so larger accessibility text is not cut off.

---

## Files added

- `src/screens/customer/ServiceCategoryProvidersScreen.tsx`

## Files replaced

- `src/screens/customer/CustomerHomeScreen.tsx`
- `src/screens/customer/CustomerNearbyServicesScreen.tsx`
- `src/screens/customer/index.ts`
- `src/navigation/CustomerNavigator.tsx`
- `src/navigation/types.ts`

---

## Install

1. Keep v1.10.31 as the current baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No native Clean/Rebuild required.
5. Normal Android Studio Run is enough.

---

## QA

### Home

Check:

- location chip sits closer to the top header
- less empty space above/below the location chip
- complete hero feels materially shorter
- title/tagline/description/search/trust items remain inside green area
- Popular Services begins higher on screen

Tap:

`Electrician`

Expected:

- Home does NOT become Search results
- dedicated Electrician provider page opens

Repeat with:

- Home Cleaning
- Dance Teacher
- Developer

### Category provider page

Check:

- correct category title
- only matching category provider feed
- search within providers
- Details
- Save / Saved
- Book
- Android Back returns to Home

### Services Near You

Check:

- old large Service Area box is gone
- compact location row appears
- complete row is tappable
- tap opens Default Location popup
- provider search/list remains unchanged
