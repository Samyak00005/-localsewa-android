# Localsewa Android v2.2.3 — Requests + Dashboard Polish Hotfix

Base: v2.2.2 Requests Clean Card UI Hotfix

## What changed

### Provider Requests
- Chat and Call now use the same compact communication action treatment as Dashboard > Active work.
- The `All` filter chip stays fixed at the left.
- Pending / Accepted / In progress / Completed / Rejected / Not completed / Canceled chips scroll horizontally to the right of `All`.
- A single subtle vertical divider appears immediately after `All` only after the user has horizontally scrolled the other filters. It disappears again when the filter strip returns to the start.
- No dividers are added between any other chips.
- Service location / route details are now shown only while the booking is in an active communication state (Accepted or In progress), matching Chat / Call visibility.
- The closed-booking `Location hidden after booking closed.` helper row was removed from Completed / Rejected / Not completed / Canceled cards.
- Customer avatar mapping was hardened for flat and nested API response shapes. The live backend intentionally exposes `customerImage` only while chat is enabled (Accepted / In progress); closed requests continue to use initials when no image is returned.

### Dashboard + Requests summary metrics
- Small metric/info cards use a slightly lower 22dp radius instead of the 28dp major-card radius.
- Main content cards keep the existing 28dp Provider surface radius.

## Unchanged
- Provider lifecycle transitions and reason confirmations.
- Provider final color palette.
- Requests data / review / note / reason blocks.
- Manual pull-to-refresh behavior.
- Customer UI and navigation.
- Real WebRTC calling remains deferred; Call continues to open the existing preview flow.

## Version
- versionName: 2.2.3
- versionCode: 20203

## Apply
Overwrite these files on top of v2.2.2:
- `src/screens/provider/ProviderRequestsScreen.tsx`
- `src/screens/provider/ProviderHomeScreen.tsx`
- `src/api/bookingApi.ts`
- `android/app/build.gradle`
- `README_v2.2.3.md`
