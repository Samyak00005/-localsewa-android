# Localsewa Android v1.10.4 — Customer Home UI Redesign

## Goal

Bring the native Customer Home screen into the same approved visual language as
the current Localsewa website screenshots, while preserving native Android
behavior and real backend data.

Apply this build over v1.10.3.

## What changed

### 1. Compact website-style header

Home header now matches the website direction more closely:

```text
[Localsewa icon]                  [Bell] [Menu]
```

Removed from the header:

```text
Localsewa
Local help, nearby
```

The logo remains icon-only because the native header is compact.

The hamburger opens a native quick menu with:

```text
All Services
Bookings
Saved Providers
Default Location
Help & Support
Profile
```

The Notification Bell keeps the real unread badge.

### 2. Location selector in Home hero

A location pill now appears at the top of the Home hero.

It reads from the real Customer profile/session location.

Tap opens:

```text
Default Location
```

No hardcoded Chandrapur/Nashik/other location is used.

If no location exists:

```text
Set your service location
```

is shown.

### 3. New hero copy

Home now uses the approved website-style hierarchy:

```text
Local services,
without the hassle.

TRUSTED HELP, CLOSE TO HOME

Compare local professionals, request a service and manage every booking from
one simple place.
```

### 4. Search redesign

Native search is now a large rounded white search surface with:

```text
Search icon
What service do you need?
Circular green Search button
```

Search still filters real provider/category/service data.

### 5. Trust strip

Below Search:

```text
Private booking chat
Local profiles
Simple booking
```

These are native informational trust points.

### 6. Popular Services redesign

Removed the old chip-only layout.

New Home design:

```text
2 columns × 3 rows
```

Each card includes:

- LOCAL SERVICES overline
- category name
- category-aware vector icon
- real provider count
- Available soon when there are no matching public providers
- arrow action

Popular ordering prefers:

```text
Electrician
Home Cleaning
Dance Teacher
Developer
Plumber
Carpenter
```

when those real active categories exist.

No fake category records are created.

If a preferred category does not exist, the app fills from the real category
API/provider data.

### 7. Emergency card

Added the approved Home emergency visual:

```text
Need help now?
Available nearby
Electrical
Plumbing
Appliance
Emergency Services →
```

Important backend boundary:

The current backend has no dedicated `emergency=1` provider query.

Therefore the emergency card is a UI/navigation entry to Services and does not
pretend the backend has a separate emergency marketplace feed.

### 8. Services Near You

New section:

```text
<REAL SAVED CUSTOMER LOCATION>

Services near you
Browse local providers and send a booking request
```

When the profile contains verified latitude/longitude, provider discovery sends:

```text
lat
lng
```

to the existing Provider directory request.

The backend can then return approximate public distance information.

The app does not invent a distance.

### 9. Provider cards

Home now uses a richer website-style provider card.

Includes:

- provider image/avatar
- provider name
- category
- location
- Verified badge
- approximate distance only when the backend returns it
- Provider Catalog block
- real service count
- real starting price when available
- rating/New
- review count
- experience
- availability
- Details
- Save/Saved
- Book

### 10. Saved Providers — real toggle connected

The inspected backend has:

```text
GET    /api/saved
POST   /api/saved
DELETE /api/saved/{provider-ref}
```

v1.10.4 now wires the Home Save button to these real endpoints.

The saved-provider query key also includes the authenticated user ID so cached
saved state cannot be reused across different signed-in accounts.

Actions:

```text
Save   → POST /saved
Saved  → DELETE /saved/{provider-ref}
```

The Saved tab and Home now share the same backend query cache.

### 11. Provider directory distance support

`providerApi.list()` now supports optional:

```text
q
category
lat
lng
limit
```

Home currently sends verified profile lat/lng when present.

The Provider parser also accepts common backend distance field names and only
shows a distance label when the backend provides one.

### 12. Homepage review feed

Added the public:

```text
GET /api/reviews/highlights
```

feed.

Only rating >= 4.5 with a real written comment is rendered.

Review cards include:

- customer identity/fallback avatar
- stars
- review comment
- provider name when exposed by the endpoint

No dummy reviews are inserted.

The review parser tolerates the current backend's mixed response naming
conventions.

### 13. Reviews visual section

New Home section:

```text
REAL CUSTOMER REVIEWS
What customers are saying
```

Uses horizontal native scrolling, similar to the approved website presentation.

### 14. Bottom navigation wording

Customer Services tab label is now:

```text
All Services
```

Route name and screen implementation remain unchanged.

## Files added

```text
src/types/home.ts
src/api/reviewApi.ts
src/hooks/useHomeReviews.ts

src/components/customer/HomeServiceCard.tsx
src/components/customer/EmergencyServiceCard.tsx
src/components/customer/HomeProviderCard.tsx
src/components/customer/HomeReviewCard.tsx
```

## Files replaced

```text
src/components/icons/AppIcon.tsx

src/api/customerApi.ts
src/api/providerApi.ts
src/hooks/useCustomerData.ts

src/components/customer/index.ts

src/components/navigation/CustomerHeader.tsx
src/navigation/CustomerTabs.tsx

src/screens/customer/CustomerHomeScreen.tsx
```

## Included existing required assets

```text
src/assets/branding/localsewa-mark.png
src/components/navigation/index.ts
```

## Dependencies

No new dependency for v1.10.4.

This build uses the v1.10.2-installed:

```text
lucide-react-native
react-native-svg
```

Do NOT run another npm install if v1.10.3 is already running.

## Install

1. Use v1.10.3 as the current project baseline.
2. Copy/replace this ZIP's files into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. No npm command.
4. Run normally from Android Studio.

## QA

### Header

Confirm Home shows:

```text
Logo                              Bell Menu
```

and no Localsewa text/subtitle in the header.

Bell must still open real Notifications.

Menu must open/close and route correctly.

### Location

- saved customer location appears
- long location truncates safely
- tapping opens Default Location
- no hardcoded city is shown

### Hero

Confirm:

- new headline
- trust tagline
- description
- large rounded search
- three trust benefits

### Popular Services

Confirm:

- 2 cards per row
- max 6 on Home
- real provider count
- zero count = Available soon
- card tap filters Home provider results
- See all opens All Services

### Emergency

Confirm green card renders correctly.

Emergency Services action opens All Services.

### Providers

Confirm:

- new richer cards
- Verified badge only from backend
- distance only when backend gives it
- service count/starting price are real
- unavailable provider cannot Book
- Details opens Provider Details
- Book opens Booking Request

### Save / Saved

With a test Customer account:

1. Save an unsaved provider.
2. Confirm button becomes Saved after query refresh.
3. Open Saved tab and confirm provider appears.
4. Return Home.
5. Remove Saved.
6. Confirm Saved tab updates.
7. Restart/reload and verify saved state persists correctly.

### Reviews

- real reviews load
- ratings are >= 4.5
- no fake cards
- horizontal scroll works
- if the backend returns no highlights, the entire review section can remain
  absent instead of inventing reviews

### Search

Search by:

```text
provider name
category
service name
location
```

Search results section should replace the normal Home discovery flow without
breaking Details/Book/Save actions.

## Backend safety boundaries

v1.10.4 does NOT:

- invent provider distances
- invent categories
- invent emergency-provider status
- invent reviews
- expose provider phone/WhatsApp
- bypass booking availability
- replace private booking chat with public contact

## Next Customer UI milestone

### v1.10.5 — All Services UI Polish

After Home visual approval:

- bring All Services page into the same visual language
- website-style search/filter hierarchy
- service/category grid
- available provider counts
- available-first provider presentation
- improved provider cards/actions
- consistent empty/loading states

Then:

```text
v1.10.6 — Bookings + Saved UI Polish
v1.10.7 — Profile + secondary pages UI Polish
Final Customer visual regression / UI freeze
v2.0.0 — Provider Workspace
```

## Still deferred platform work

- Android FCM push
- real voice calling/WebRTC
- Google Sign-In
- profile-photo upload until EXIF/media privacy hardening
- full Provider notification detail deep-links
