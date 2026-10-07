# Localsewa Android v1.10.12 — Saved Providers UI Polish

## Base

Apply this build over:

```text
v1.10.11 — Inline Review Hotfix
```

No new npm package is required.

## Goal

Bring the Customer `Saved providers` page into the same visual language as:

```text
Home
All services
Bookings
Booking details
```

while preserving the existing real saved-provider backend flow.

## Page structure

```text
Saved providers
Subtitle                                      [saved count]

[ Saved Provider Card ]
[ Saved Provider Card ]
[ Saved Provider Card ]
```

No extra search field was added because Saved Providers is already a curated
shortlist. If search is added later, it should use the shared
`CustomerSearchBar`.

## Saved provider card

Each card now shows:

- circular provider image / avatar fallback
- provider name
- verified badge where applicable
- provider category
- provider location
- saved bookmark state
- rating + review count
- experience
- service count
- starting price
- current availability
- Details
- Remove
- Book

## Actions

### Details

Opens:

```text
ProviderDetails
```

### Remove

Uses the existing real saved-provider mutation:

```text
DELETE /api/saved/{provider-ref}
```

The provider disappears from the Saved list after the saved-provider query is
invalidated/refetched.

Because Home also reads the same saved-provider query, the saved state remains
synchronized across Customer discovery surfaces.

### Book

Opens:

```text
BookingRequest
```

for the same provider.

If the provider is unavailable, the Book action is disabled.

## Sorting

Saved providers are presented:

```text
Available first
then higher rating
then provider name
```

The backend data itself is not modified.

## Empty state

When there are no saved providers:

```text
No saved providers yet

Save providers you may want to contact
or book again later.

[ Browse all services ]
```

The CTA opens the existing All services tab.

## Loading state

The page uses a Saved-provider-shaped skeleton with:

- circular provider identity
- provider copy
- three info tiles
- action area

This reduces layout shift.

## Visual consistency

The page follows the current Customer system:

- same neutral background
- same green role color
- circular provider identity
- rounded cards
- pill action buttons
- light green availability surfaces
- shared bottom navigation/header from CustomerTabs

## Files added

```text
src/components/customer/SavedProviderCard.tsx
```

## Files replaced

```text
src/components/customer/index.ts
src/screens/customer/CustomerSavedScreen.tsx
```

## Dependencies

No npm install.

## Install

1. Keep v1.10.11 as the current baseline.
2. Copy/replace the ZIP contents into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do not run `npm install`.
4. Run normally from Android Studio.

## Real-device QA

### Saved list

Confirm:

- Saved tab opens normally
- green Customer header remains
- bottom nav remains
- provider count is correct
- available providers appear first
- provider images are circular

### Provider cards

Check:

- name/category/location
- verified badge
- rating/review count
- experience
- service count
- starting price
- availability

### Details

Tap Details and confirm Provider Details opens.

### Remove

Tap Remove and confirm:

- real provider is removed from Saved
- card disappears
- count updates
- leaving/reopening Saved does not restore it
- Home saved state also updates after query refresh

### Book

For available provider:

- Book opens Booking Request

For unavailable provider:

- Book is disabled

### Empty state

Remove all saved providers or test an empty account:

- empty state appears
- Browse all services opens All services

## Next page

After Saved Providers is approved:

```text
Customer Profile UI Polish
```

Then:

```text
Provider Details + Booking Request
Chat / Notifications secondary consistency
Account / Security / Location
Final Customer regression
Customer UI freeze
v2.0.0 Provider Workspace
```
