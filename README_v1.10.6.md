# Localsewa Android v1.10.6 — All Services UI Polish

## Base

Apply this build over:

```text
v1.10.5 — Customer Home UI Fixes
```

No new npm package is required.

## 1. All Services page redesigned

The old All Services page used:

- a different rectangular search input
- a single-column category list
- a large generic catalog card
- limited visual relationship to the new Home design

v1.10.6 brings it into the same Customer visual system as Home.

New page order:

```text
All services
Description
Shared Customer Search Bar

Service categories
2-column category cards
Show more / Show fewer

Available / Matching providers
Provider list

Emergency Services card
```

## 2. Service categories now use a 2-column grid

All Services uses the same service-card design language as Home:

- category icon
- category name
- real provider count
- `Available soon` when provider count is zero
- arrow affordance

Categories with active providers are sorted first.

Then categories are sorted by provider count and category name.

Initial mobile view shows:

```text
10 categories
```

`Show more services` adds 10 more at a time.

This keeps the 121-category catalog usable on a phone instead of rendering an
extremely long block immediately.

When Search is active, matching categories are shown directly.

## 3. Emergency Services card added at the end

The same approved `Need help now?` component used on Home is now rendered at
the bottom of All Services.

This keeps the emergency visual language consistent across both discovery
pages.

Important:

The current backend still does not expose a dedicated emergency-provider flag.
The card does not invent emergency availability data.

## 4. Customer header is now green on ALL five primary tabs

Previously:

```text
Home        → green
All services → white
Bookings     → white
Saved        → white
Profile      → white
```

Now:

```text
Home
All services
Bookings
Saved
Profile
```

all use the same Customer green:

```text
#18A35B
```

Bell and Hamburger remain white bare icons.

Status-bar content is light on all five Customer main tabs.

This removes the header color jump when switching tabs.

## 5. One shared Customer search component

Added:

```text
src/components/customer/CustomerSearchBar.tsx
```

The approved Home search design is now the canonical Customer search bar:

- white pill
- Search icon on left
- same input typography
- circular green Search button
- same radius
- same shadow
- same height
- same spacing

Both:

```text
Home
All services
```

now use this exact component.

Future Customer pages that need service/provider search should use this
component rather than creating another search variation.

## 6. Home refactored to use shared search

Home UI is intentionally unchanged visually.

Only the previous inline search implementation was replaced with:

```tsx
<CustomerSearchBar />
```

This prevents Home and All Services from drifting apart later.

## 7. Provider ordering

All Services providers are ordered:

```text
Available first
then higher rating
```

Search supports:

- provider name
- category
- location
- provider service names

## Files added

```text
src/components/customer/CustomerSearchBar.tsx
```

## Files replaced

```text
src/components/customer/index.ts
src/components/navigation/CustomerHeader.tsx

src/screens/customer/CustomerHomeScreen.tsx
src/screens/customer/CustomerServicesScreen.tsx
```

## Dependencies

No npm install.

v1.10.6 continues using the existing v1.10.5 dependencies.

## Install

1. Keep v1.10.5 as the current baseline.
2. Copy/replace the ZIP contents into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do not run npm install.
4. Run normally from Android Studio.

## Real-device QA

### Header consistency

Switch through:

```text
Home
All services
Bookings
Saved
Profile
```

Confirm the header remains the same green on every tab.

Also confirm:

- logo spacing remains correct
- Bell remains white
- Hamburger remains white
- no visible icon containers return
- notification popup still works
- sidebar still works

### Search consistency

Compare Home and All Services directly.

Both must have the exact same:

- height
- rounded pill shape
- left Search icon
- placeholder typography
- circular right Search button
- white background
- shadow

### All Services categories

Confirm:

- 2 columns
- category cards do not stretch full-width
- real provider count shown
- unavailable categories show `Available soon`
- 10 categories initially
- Show more adds 10
- Show fewer returns to 10
- category tap filters matching providers

### All Services search

Search:

```text
Electrician
Cleaning
provider name
location
service name
```

Confirm category/provider results update correctly.

Clear returns to the normal catalog.

### Providers

Confirm:

- available providers show before unavailable
- Provider Details still opens
- no duplicate/mutated provider list issue
- loading/error/empty states remain usable

### Emergency section

Scroll to the very end of All Services.

Confirm the same Home emergency card is present and visually intact.

## Next Customer UI milestone

After v1.10.6 approval:

```text
v1.10.7 — Bookings + Saved UI Polish
```

Then:

```text
v1.10.8 — Profile + Secondary Pages UI Polish
Customer UI final regression / freeze
v2.0.0 — Provider Workspace
```

## Still intentionally pending

- real Android FCM push notifications
- real WebRTC calling
- native Google Sign-In
- profile-photo upload until backend image metadata/EXIF hardening
- final Provider notification deep-link integration after Provider workspace
