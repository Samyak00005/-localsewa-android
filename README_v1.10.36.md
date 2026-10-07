# Localsewa Android v1.10.36 — Provider Business Profile Redesign

## Base

Apply over:

`v1.10.35 — Hero 40% Background Hotfix`

No npm install.
No Android/Kotlin changes.

## Provider Details redesign

### Business photo gallery

Real provider business photos now appear at the top of the Provider Details
identity card in a horizontal 16:9 gallery.

- `business_image` is included as the primary business photo when present.
- `business_images` are included as additional gallery images.
- duplicate URLs are removed.
- no placeholder portfolio is shown when the provider has no business photo.
- multiple photos can be swiped.
- gallery shows `1 / N` and small page dots.
- tapping a business photo opens the full-screen media viewer.

### Profile photo

`profile_image` is now mapped separately from business photos.

- circular profile image remains in the identity area.
- tapping the real profile photo opens it full screen.
- a small expand indicator communicates that the photo is interactive.
- providers without a profile photo continue using initials/avatar fallback.

The old `imageUrl` field remains for compatibility with existing Home / All
Services cards.

### Profile + About merged

The old separate About card is removed.

Provider identity and About now live in one card:

- business gallery
- profile photo
- provider name
- verified badge
- category
- service area
- approximate distance when supplied
- availability
- Rating
- Reviews count
- Experience
- About text

### Removed from profile summary

The duplicate `Services` stat has been removed because the Services section
already exists immediately below.

The secondary:

- HOME SERVICE
- SHOP SERVICE

chips are also removed from the top profile summary.

The backend fields remain untouched.

### Availability

Availability is now shown as lightweight status text:

`● Available`

or

`● Unavailable`

Green is used for available; neutral grey is used for unavailable.

Verified remains a separate badge because verification and availability mean
different things.

### Services section simplified

Published services no longer look like separate clickable buttons/cards.

They now appear inside one Services card with:

- service name
- service description
- right-aligned price
- thin divider between services

No individual service row is presented as an interactive control.

### Written Reviews section removed

The large list of written review cards is removed from Provider Details.

The provider's aggregate:

- Rating
- Reviews count

remains in the profile stats.

No backend review data is deleted or changed.

### Request Service

The existing real booking CTA remains at the bottom:

`Request service`

Unavailable providers still receive the existing disabled state.

## Full-screen media viewer

Both provider profile photos and business photos can open in a dark full-screen
viewer.

Business galleries can be swiped horizontally and display the current image
count.

No external image-viewer dependency is used.

## Files replaced

- `src/types/provider.ts`
- `src/api/providerApi.ts`
- `src/screens/customer/ProviderDetailsScreen.tsx`

## Install

1. Keep v1.10.35 as the current working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No native Clean/Rebuild required.
5. Normal Android Studio Run is enough.

## QA

Test providers with:

- profile photo only
- business photo only
- multiple business photos
- no photos
- long About text
- one service
- multiple services
- no service price
- Available
- Unavailable
- Verified
- Unverified

Confirm:

- business photo is 16:9
- multiple business photos swipe
- gallery count changes correctly
- business photo opens full screen
- profile photo opens full screen
- Services stat is gone
- Home/Shop Service chips are gone
- About is merged into top card
- written Reviews list is gone
- Rating and Reviews count remain
- service rows are divided by lines rather than boxed individually
- availability uses green/grey dot
- Request service still works
