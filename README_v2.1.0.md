# Localsewa Android v2.1.0 — Provider Dashboard

Incremental feature patch for the v2.0.17 baseline.

## Scope

This update replaces the Provider Dashboard placeholder with a real native dashboard using the existing Hostinger contracts and locked Localsewa design system.

### Provider Dashboard
- Compact business overview card with profile image, business/category/location, availability and today's request count.
- Four key stats: pending requests, active jobs, completed jobs and rating.
- Pending "Needs attention" list from provider-scoped bookings.
- Active work list for ACCEPTED / IN_PROGRESS bookings.
- Business performance card for rating, reviews, completed jobs and services.
- Quick actions: Add service, Manage services, Manage photos, Edit profile.
- Localsewa+ membership summary that keeps the Provider emerald UI and uses premium accents only for entitlement state.
- Recent closed activity summary.
- Pull-to-refresh.
- Dashboard refreshes again whenever its tab regains focus.
- Pending request count refreshes every 30 seconds while mounted.
- Partial failures are isolated: a provider-bookings refresh error does not erase dashboard/profile data.

### Navigation refinements
- Dashboard `Add service` opens the existing Services editor.
- Dashboard `Manage photos` opens the existing business-photo manager.
- Dashboard `Edit profile` opens the existing Provider profile editor.

### API integration
- Extends `/api/provider/dashboard` parsing to the existing real `stats`, `services` and `requests` fields.
- Adds `/api/provider/request-count` mapping using `pendingCount`.
- Adds provider booking list support through `GET /api/bookings?scope=provider`.
- No mocked request, rating, job, service or membership data.

## Deliberately not added
- No earnings/revenue card. The current booking backend stores service price but does not provide a verified payment/settlement ledger.
- Dashboard does not add Accept / Reject / In Progress / Complete mutations. Full Provider Requests + Request Details lifecycle remains the next provider milestone.

## Version
- versionName: 2.1.0
- versionCode: 20100

## Install
Overwrite this patch on top of the v2.0.17 source tree, then rebuild normally in Android Studio.
