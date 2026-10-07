# Localsewa Android v1.10.3 — Customer UI Header Polish

## Purpose

This is the first Customer-role UI cleanup build before Provider v2.0.0.

It fixes the missing top application header/app-bar on the five Customer main
tabs while preserving the already approved Customer layouts and backend logic.

Apply this build over v1.10.2.

## What changed

### Proper Customer app header

The five Customer primary tabs now get a fixed native header:

```text
Home
Services
Bookings
Saved
Profile
```

Header contents:

```text
Localsewa mark + Localsewa
Local help, nearby
Notification Bell + unread badge
```

### Home header

Home uses a seamless Customer-green header so the app shell and green hero feel
like one product surface.

The old duplicated Home-only:

```text
LOCALSEWA pill
Bell inside hero
```

has been removed.

Notifications now live in the real app header.

### Other Customer tabs

Services, Bookings, Saved and Profile use the same header structure with:

- white surface
- Localsewa branding
- Customer-green notification action
- proper divider
- status-bar safe area

### Safe area / camera cutout

The header uses `react-native-safe-area-context`.

This prevents brand/actions from sitting under:

- Android status bar
- Pixel camera cutout
- future supported Android device top insets

### Status bar

Home:

```text
light status-bar content
green shell
```

Other Customer tabs:

```text
dark status-bar content
light shell
```

### Bottom navigation polish

Bottom navigation now calculates bottom safe-area padding rather than relying
only on a fixed bottom value.

The existing v1.10.2 vector icons and selected states are preserved.

## New asset

Added an icon-only Localsewa mark derived from the existing approved launcher
artwork:

```text
src/assets/branding/localsewa-mark.png
```

The wordmark/tagline are intentionally excluded from this tiny asset because
they are unreadable at 40dp. The header renders the text `Localsewa`
natively next to the mark.

## Files added

```text
src/assets/branding/localsewa-mark.png

src/components/navigation/CustomerHeader.tsx
src/components/navigation/index.ts
```

## Files replaced

```text
src/navigation/CustomerTabs.tsx
src/screens/customer/CustomerHomeScreen.tsx
```

## Dependencies

No new npm dependency is required for v1.10.3.

v1.10.3 assumes v1.10.2 is already installed, including:

```text
lucide-react-native
react-native-svg
```

If v1.10.2 already runs on your emulator, do NOT run another npm install for
this version.

## Install

1. Stop the running app if needed.
2. Copy/replace the files from this ZIP into:
   `E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp`
3. No npm command is required.
4. Run normally from Android Studio.

## QA

### Home

Confirm:

- status bar visible
- proper Localsewa header visible
- icon + `Localsewa` visible
- Notification Bell visible at top-right
- unread badge appears when applicable
- no duplicate `LOCALSEWA` pill in hero
- no second Bell inside hero
- green header joins the green hero cleanly
- search/provider sections still work

### Services

Confirm:

- light Localsewa header
- Bell works
- page title/content starts below header
- nothing is hidden under the camera/status bar
- bottom navigation remains visible

### Bookings

Confirm same header behavior and that Booking list interactions are unchanged.

### Saved

Confirm same header behavior and Provider cards remain unchanged.

### Profile

Confirm:

- proper header
- profile/settings content starts below it
- Settings icons from v1.10.2 still render
- Provider switch / Sign out behavior unchanged

### Navigation

Confirm:

- switching between all five tabs does not duplicate headers
- header does not scroll away with page content
- secondary pages such as Provider Details / Booking Details do NOT become
  bottom tabs
- Android system/navigation Back behavior is unchanged

## Customer UI work after this build

After v1.10.3 visual QA, continue page-by-page before Provider v2.0.0:

### v1.10.4 — Home + Services polish

- spacing/hierarchy
- service category presentation
- search alignment
- provider-card density
- loading/error/empty visual consistency

### v1.10.5 — Bookings + Saved polish

- booking tabs/status layout
- booking cards
- accepted/pending/completed visual states
- Saved empty/list states
- Booking Details visual hierarchy

### v1.10.6 — Profile + secondary pages polish

- Profile/settings hierarchy
- Notifications
- Provider Details
- Booking Request
- Chat
- Review
- Location
- Account-security forms
- Help / Terms / Privacy / Deletion

### Customer visual lock

Then perform one final Customer-role visual regression pass and freeze the
Customer UI before Provider v2.0.0 begins.

## Deferred necessary platform work

Still intentionally held:

- real Android push / FCM
- real WebRTC voice calling
- Google Sign-In
- profile-photo upload until backend image metadata stripping is hardened
- Provider notification detail deep-links until Provider native workspace exists
