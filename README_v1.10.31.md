# Localsewa Android v1.10.31 — All Services UI Polish

## Base

Apply over:

`v1.10.30 — Saved Provider API Hotfix`

No npm install.
No Android/Kotlin changes.

---

## 1. All Services now reuses Home provider cards

The old simplified All Services provider card is removed from this screen.

All Services now uses the same:

`HomeProviderCard`

already used in Home -> Services near you.

Each provider therefore has the same information hierarchy and actions:

- provider photo
- name
- verified badge
- category
- area / approximate distance where available
- provider catalog
- starting price
- rating / review count / experience
- availability
- Details
- Save / Saved
- Book

This also means the shared saved-provider workflow from v1.10.30 is used here.

---

## 2. Home -> Services near you shows only 3 providers

When Home is not in search mode:

- only the first 3 sorted providers are shown
- the existing `See all` action opens the dedicated Services Near You page

Home remains a preview instead of becoming a full provider directory.

Search mode can still show matching search results.

---

## 3. Service category cards are now 4:3

The shared service card changed from:

`1:1`

to:

`4:3`

The card also received small internal spacing adjustments so two-line names such
as:

- Bathroom Cleaning
- Aquarium Service
- Appliance Repair

fit without the excessive vertical empty area visible in the square layout.

The same improved ratio is automatically used on Home Popular Services and All
Services because both screens share `HomeServiceCard`.

---

## 4. Show more services is compact

The old large full-width outlined button is removed.

Service expansion now uses compact pill controls.

Initial category count:

`8`

When more categories exist:

`Show more services`

After expanding, a compact:

`Show fewer`

action is also available.

Each Show more press loads the next 8 category cards.

---

## 5. Provider count pill removed

The extra person-icon + provider-count badge beside `Available providers` is
removed.

The count is now kept in the subtitle:

`4 providers · available providers are shown first`

This keeps the heading lighter.

---

## 6. Category selection is clearer

Tapping a service category now selects it as a real provider filter instead of
overwriting the search text.

A small active filter chip appears below the search bar, for example:

`Electrician ×`

Tap the chip to clear the category filter.

The selected category card also gets a subtle stronger green border.

Search text and category filter can work together.

---

## 7. Provider list is less overwhelming

All Services initially shows:

`4 provider cards`

If more matching providers exist, a compact:

`Load more providers`

control loads the next 4.

After expanding, `Show fewer` is available.

This avoids rendering a long wall of rich HomeProviderCards immediately.

---

## 8. Emergency card

The Emergency Services card remains at the end of All Services.

Its placement is unchanged.

---

## Files replaced

- `src/screens/customer/CustomerServicesScreen.tsx`
- `src/screens/customer/CustomerHomeScreen.tsx`
- `src/components/customer/HomeServiceCard.tsx`

---

## Install

1. Keep v1.10.30 as the working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No native Clean/Rebuild required.
5. Normal Android Studio Run is enough.

---

## QA

### Home

Confirm:

- Popular Service cards are 4:3
- grid remains 2 columns
- Services near you shows maximum 3 providers
- See all opens dedicated Services Near You page
- Save still persists into Saved tab

### All Services

Confirm:

- first 8 categories shown
- service cards are 4:3
- compact Show more
- selected category gets subtle active border
- selected category filter chip appears
- chip X clears category
- Search + selected category can work together
- Available Providers no longer has count pill
- provider cards match Home exactly
- Details opens Provider Details
- Save persists into Saved tab
- Book opens Request Service
- initial provider batch is 4
- Load more providers works
- Show fewer works
- Emergency Services remains at the end
