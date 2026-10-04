# Localsewa Android v1.7.0 — Customer Backend Foundation

## Summary

v1.7.0 moves the Customer workspace from placeholder pages to real Localsewa
backend data.

This version does not copy the UI from the previous Android build. The old
project is used only as a source of verified API contracts and response-shape
knowledge.

## Version

`v1.7.0`

## Customer page baseline

The Customer side is now planned around these product pages:

### Core discovery

- Home
- Services
- Search/discovery
- Provider Details
- Saved Providers

### Booking

- Bookings
- Booking Details
- Booking creation/request
- Chat

### Account/support

- Notifications
- Profile
- Account Settings
- Help & Support
- Terms & Conditions
- Privacy Policy
- Account Deletion

The first five discovery pages are the focus of v1.7.x.

Admin remains outside the current Android roadmap.

## What v1.7.0 connects

### Provider discovery

Real endpoint:

```text
GET /api/providers?limit=150
```

Used by:

- Customer Home
- Services
- Search/filtering

### Provider details

Real endpoint:

```text
GET /api/providers/{providerId}
```

Used by:

- Provider Details
- services offered
- pricing
- ratings/reviews
- provider availability
- provider service modes

### Saved providers

Real endpoint:

```text
GET /api/saved
Authorization: Bearer <token>
```

Used by:

- Saved Providers page

This version connects the saved-list read path only.

No save/unsave write endpoint is invented.

## Full category catalog

The previous Android project does NOT contain a verified endpoint for the full
121-category catalog.

Therefore v1.7.0 does NOT hardcode or invent 121 production categories.

Instead:

- Home shows categories represented by live provider data.
- Services shows categories represented by live provider data.
- When the dedicated category/catalog API contract is identified, these screens
  can use the complete catalog without changing the navigation architecture.

This is intentional data-integrity behavior.

## TanStack Query

v1.7.0 introduces TanStack Query v5 for server state.

Benefits:

- shared provider cache between Home and Services
- provider-details cache
- saved-provider cache
- request retry
- stale-time handling
- clean loading/error states
- later mutation support for booking/save actions

## Required dependency

From the project root:

```powershell
npm install @tanstack/react-query@^5
```

No other new npm dependency is required.

## Navigation change

Customer navigation now uses a stack around the existing Customer tabs:

```text
CustomerNavigator
├── CustomerTabs
│   ├── Home
│   ├── Services
│   ├── Bookings
│   ├── Saved
│   └── Profile
│
└── ProviderDetails
```

This gives Provider Details a proper secondary route without turning it into a
bottom-tab destination.

## UI behavior

### Customer Home

Fresh design includes:

- Localsewa Customer hero
- Search field
- live category chips
- available-provider-first ordering
- real provider cards
- loading skeletons
- error/retry state
- no fake provider data

### Services

Includes:

- service/provider search
- live provider-derived category list
- all real providers
- availability-first ordering
- Provider Details navigation

### Provider Details

Displays real backend fields when available:

- provider name
- category
- location
- verified state
- availability
- rating/review count
- experience
- service count
- description
- home/shop service modes
- service list
- service price
- reviews

Booking CTA is intentionally disabled until the real booking creation contract
is implemented in v1.8.x.

### Saved Providers

Uses the authenticated `/api/saved` response.

Includes:

- real saved list
- skeleton loading
- error/retry
- empty state
- Provider Details navigation

## Files

### Add

```text
src/types/provider.ts

src/api/providerApi.ts
src/api/customerApi.ts

src/hooks/useCustomerData.ts

src/components/customer/SectionHeader.tsx
src/components/customer/ProviderCard.tsx
src/components/customer/ProviderListSkeleton.tsx
src/components/customer/index.ts

src/navigation/CustomerNavigator.tsx

src/screens/customer/ProviderDetailsScreen.tsx
```

### Replace

```text
App.tsx
src/api/apiClient.ts
src/navigation/types.ts
src/navigation/RootNavigator.tsx

src/screens/customer/CustomerHomeScreen.tsx
src/screens/customer/CustomerServicesScreen.tsx
src/screens/customer/CustomerSavedScreen.tsx
src/screens/customer/index.ts
```

Existing Auth, Provider placeholder workspace and Android branding remain in
place.

## QA checklist

### Setup

1. Copy/replace v1.7.0 files.
2. Install TanStack Query v5.
3. Gradle Sync is not normally required for this JS-only dependency.
4. Start Metro.
5. Run app.
6. Login with a real Localsewa account.

### Customer Home

1. Confirm real providers load.
2. Confirm no dummy provider names appear.
3. Confirm available providers sort before unavailable providers.
4. Search by provider name.
5. Search by category.
6. Search by location.
7. Tap a live category chip.
8. Tap a provider.

### Services

1. Confirm real provider-derived categories appear.
2. Search by service/category/provider.
3. Tap category.
4. Open Provider Details.

### Provider Details

1. Check provider photo/fallback avatar.
2. Check category/location.
3. Check availability.
4. Check rating/review count.
5. Check service list and prices.
6. Check reviews.
7. Use Android system Back.

### Saved Providers

1. Open Saved.
2. Confirm authenticated saved providers load.
3. Open saved provider details.
4. Verify empty state on an account with no saved providers.

### Error states

1. Temporarily disable emulator network.
2. Retry Home provider request.
3. Restore network.
4. Confirm Retry recovers.

## Known limitations

- Full 121-category catalog API is not identified in the old Android build.
- Save/unsave mutation is not connected yet.
- Booking creation is not connected yet.
- Customer Bookings tab still uses the placeholder from v1.4.x.
- Notifications/chat are not connected yet.
- Location/GPS distance is not implemented yet.
- Navigation icons are still temporary.
- Inter font is still pending.
- Google Sign-In remains on hold.

## Next — what we will do next

### v1.7.1 / v1.7.x — Customer Discovery Refinement

After visual/API QA we can refine:

- Home layout
- service/category presentation
- search UX
- Provider Details hierarchy
- image gallery
- saved state/write endpoint once verified
- real icons

### v1.8.0 — Booking Foundation

Then we move to:

1. identify/verify booking creation API
2. booking request form
3. customer booking list
4. active/cancelled/completed states
5. booking details
6. cancellation rules
7. payment/amount display
8. prepare booking-linked Chat route

No fake booking creation will be implemented before the backend contract is
verified.
