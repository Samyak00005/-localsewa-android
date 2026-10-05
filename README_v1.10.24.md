# Localsewa Android v1.10.24 — Provider Details UI Polish

## Base

Apply over:

```text
v1.10.23 — Customer WhatsApp Removal
```

This is a single-screen TypeScript UI patch.

No npm install.
No Android/native change.

## Goal

Redesign Customer Provider Details so it matches the current approved Customer
design language used by Home, All Services, Bookings, Saved and Profile.

The backend/provider contract is unchanged.

## 1. Customer shell restored

Provider Details now includes:

- green Customer header
- Bell notification popup
- Hamburger sidebar
- Customer bottom navigation
- `All services` shown as the active primary destination

This prevents Provider Details from looking like a detached page.

## 2. Provider identity card redesigned

The top provider card now uses:

- circular provider image / avatar
- provider name
- VERIFIED badge when applicable
- category
- coarse provider location
- approximate distance when returned by backend
- availability
- Home Service / Shop Service badges

No private provider phone/email/WhatsApp data is exposed.

## 3. Provider statistics redesigned

The old plain four-column text row is replaced with four compact information
tiles:

- Rating
- Reviews
- Experience
- Services

Each tile uses the shared icon system and the Customer soft surface.

## 4. About section

About remains conditional.

It is only rendered when the real provider payload includes a description.

No placeholder marketing text is generated.

## 5. Services section redesigned

Each real published provider service now appears in its own compact service
card:

- service name
- service description when available
- starting/service price in a green price pill

If no published services exist, the page keeps the existing honest custom
service message.

No fake service names or prices are added.

## 6. Reviews redesigned

Reviews now use individual soft review cards with:

- star rating
- written review
- review date when the backend returned a usable `created_at`

The page still displays at most the first five review items returned by the
provider-details API.

If a rating has no written comment, the UI says so instead of inventing text.

## 7. Booking CTA redesigned

The final booking section now makes the next action clearer.

Available provider:

```text
Ready to request this provider?

Choose a service, verify the job address and send your request.
In-app chat becomes available after the provider accepts.

[ Request service ]
```

Unavailable provider:

```text
Provider currently unavailable

This provider is not accepting new booking requests right now.

[ Provider unavailable ]
```

The real existing `BookingRequest` flow is unchanged.

## 8. Communication/privacy rule preserved

Provider Details does NOT add:

- public phone number
- WhatsApp
- direct public chat button
- direct pre-booking call button

The current product rule remains:

- send booking request
- provider accepts
- booking-scoped In-App Chat becomes available

## 9. Loading and error states

The Provider Details skeleton now better matches the final layout:

- circular provider identity
- stats tiles
- section placeholders

Existing Retry behavior is preserved.

## File replaced

```text
src/screens/customer/ProviderDetailsScreen.tsx
```

## Install

1. Keep v1.10.23 as the current working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No native Clean/Rebuild is required because this is TypeScript-only.
5. Run normally from Android Studio.

## Real-device QA

Open Provider Details from:

- Home provider card
- All Services provider card
- Saved provider Details

Check:

- green Customer header
- Bell
- Hamburger
- All services bottom-nav active state
- circular provider photo
- VERIFIED badge
- category/location/distance
- all four stats
- availability/service-mode badges
- About
- Services
- service prices
- Reviews
- review dates where present
- Request service
- unavailable provider behavior
- Android Back behavior
- long service names/descriptions
- long review text
- screen scrolling

## Next

After Provider Details is approved:

```text
Booking Request UI Polish
```

Then we can run the final Customer booking/discovery consistency pass.
