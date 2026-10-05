# Localsewa Android v1.10.5 — Customer Home UI Fixes

## Base

Apply this build over:

```text
v1.10.4 — Customer Home UI Redesign
```

No new npm package is required.

## Fixes in this build

### 1. Popular Services is now guaranteed 2-column

The previous percentage-width + flex-wrap layout could collapse into one card
per row on some real devices.

The Home screen now explicitly creates rows of two cards:

```text
[ Service 1 ] [ Service 2 ]
[ Service 3 ] [ Service 4 ]
[ Service 5 ] [ Service 6 ]
```

Each card flexes equally inside its row.

If an odd number is ever shown, an invisible spacer preserves the left-column
width instead of stretching the final card full width.

### 2. Hamburger now opens a real sidebar

The old small popup quick-menu is removed.

Hamburger now opens a full-height right-side drawer with a dimmed page backdrop.

Sidebar contains:

```text
Home
All Services
Bookings
Saved Providers
Profile

Default Location
Help & Support
Terms & Conditions
Privacy Policy
```

Behavior:

- page behind it is blocked while open
- tap outside closes
- Android Back closes
- close button closes
- menu selection closes drawer and navigates

### 3. Header + Hero use exactly the same green

Shared token:

```text
#18A35B
```

is now used by both:

```text
Customer Home header
Customer Home hero
```

This removes the visible shade seam between them.

### 4. Notifications open as a modal popup

The Header Bell no longer opens the separate Notifications page.

It opens an in-app modal panel similar to the provided website reference:

```text
Notifications                         X
Updates appear automatically...

You're all caught up / N unread

28 SEP 2026
[ notification ]
[ notification ]

27 SEP 2026
[ notification ]
```

The modal still uses the real existing notification backend:

```text
GET   /api/notifications
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all
```

Notification tap behavior is preserved:

- Booking → Booking Details
- Chat → Booking Chat where eligible
- Provider-targeted notification → Provider workspace when available
- Booking feed notification → Customer Bookings

The dedicated Notifications screen is not deleted because it can remain useful
for future deep links/navigation, but the header Bell now uses the popup.

### 5. Bell / Hamburger visual containers removed

Header actions are now bare icons.

Removed:

- circular background
- outline/border container

Kept:

- 42–48dp touch target
- accessibility labels
- unread badge on Bell

So the UI looks lighter without reducing tap usability.

### 6. Header height improved

Header content height is now:

```text
64dp
```

plus Android safe-area/status-bar inset.

This gives the logo and actions better vertical breathing room.

### 7. Logo edge spacing fixed

Header horizontal inset is increased to:

```text
18dp
```

Logo is:

```text
42 × 42
```

and no longer sits against the left edge.

### 8. Profile/provider photos standardized to circles

Updated Customer-role surfaces:

```text
Home provider cards
Services/Saved ProviderCard
Provider Details
Booking cards
```

Existing circular surfaces remain circular:

```text
Customer Profile
Booking Chat
Call Preview
Review avatars
Avatar fallback component
```

Result: profile/provider identity images follow one circular shape language.

### 9. Bottom navigation Services item updated

Label:

```text
All services
```

Icon:

```text
Layout Grid
```

This replaces the previous generic service icon treatment and matches the
website navigation direction more closely.

## Files added

```text
src/constants/customerUi.ts

src/components/navigation/CustomerSidebar.tsx
src/components/navigation/CustomerNotificationsModal.tsx
```

## Files replaced

```text
src/components/icons/AppIcon.tsx

src/components/navigation/CustomerHeader.tsx
src/components/navigation/index.ts

src/components/customer/HomeServiceCard.tsx
src/components/customer/HomeProviderCard.tsx
src/components/customer/ProviderCard.tsx
src/components/customer/BookingCard.tsx

src/navigation/CustomerTabs.tsx

src/screens/customer/CustomerHomeScreen.tsx
src/screens/customer/ProviderDetailsScreen.tsx
```

## Dependencies

No new npm command.

The build continues using the already-installed:

```text
lucide-react-native@1.21.0
react-native-svg
```

Do not reinstall them if v1.10.4 is already running.

## Install

1. Keep v1.10.4 as the current baseline.
2. Copy/replace the v1.10.5 ZIP contents into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. No npm install.
4. Run normally from Android Studio.

## Real-device QA

### Header

Check on phone:

- logo has comfortable left spacing
- header is taller
- Bell has no background container
- Hamburger has no background container
- header and hero are exactly one green shade
- unread badge remains readable

### Popular Services

Confirm:

```text
2 cards per row
3 rows for 6 cards
```

Test on the real phone width where v1.10.4 collapsed to one column.

### Sidebar

- Hamburger opens right sidebar
- page behind cannot scroll/tap
- outside tap closes
- Android Back closes
- All Services route works
- Bookings route works
- Saved route works
- Profile route works
- Account/support routes work

### Notifications

- Bell opens popup, not a separate page
- modal can scroll
- dates are grouped
- unread count is shown
- Mark all read works
- X closes
- outside tap closes
- Booking notification opens Booking Details
- Chat notification opens Chat/Booking Details according to backend eligibility
- Provider notification still switches workspace when permitted

### Circular images

Inspect:

- Home providers
- All Services providers
- Saved providers
- Provider Details
- Bookings
- Chat
- Profile
- Reviews

Provider/profile images should now use circles consistently.

### Bottom navbar

Confirm:

```text
Home
All services
Bookings
Saved
Profile
```

and All services uses the new grid icon.

## Next milestone

After this real-device hotfix passes:

```text
v1.10.6 — All Services UI Polish
```

Then:

```text
v1.10.7 — Bookings + Saved UI Polish
v1.10.8 — Profile + Secondary Pages UI Polish
Customer UI final regression / freeze
v2.0.0 — Provider Workspace
```

## Still intentionally pending

- real Android FCM push
- real WebRTC voice calling
- Google Sign-In
- profile-photo upload until backend EXIF/media privacy hardening
- final Provider notification detail routing after Provider workspace exists
