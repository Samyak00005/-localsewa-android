# Localsewa Android v2.0.0 — Provider Profile / Reviews / Header / Bottom Navbar

## Baseline

- Built from the reconstructed and verified **v1.10.45 Provider Gallery Width Hotfix** baseline.
- Android version updated to `versionCode 20000` / `versionName 2.0.0`.
- This is a full source build. No new npm dependency was added.
- Customer screens/components were not changed for this Provider milestone.

## Scope completed

### 1. Provider Header

- Provider-specific dark emerald header.
- Localsewa mark at left.
- `PROVIDER WORKSPACE` indication.
- Standard / Plus badge driven by the real Localsewa+ membership endpoint.
- Real notification bell using the existing authenticated notification feed.
- Provider notification sheet is read-only for this milestone and supports marking an item read.
- No Provider hamburger/sidebar added.

### 2. Provider Bottom Navbar

Final Provider tabs are now:

- Dashboard
- Requests
- Services
- Reviews
- Profile

The existing shared Lucide icon system is used with one consistent icon size and active-state treatment.

Dashboard, Requests and Services remain lightweight route foundations in this build. Their major functionality is intentionally scheduled after the Profile/Reviews foundation.

### 3. Provider Profile

Connected to real Provider backend contracts:

- `GET /api/provider/dashboard`
- `PUT /api/provider/profile`
- `PATCH /api/provider/availability`
- `GET /api/provider/premium`

The screen uses the real `data.provider` dashboard payload, including available fields such as:

- business name
- owner name
- category
- location/service area
- description
- profile image
- business gallery
- rating / review count
- availability
- membership entitlement

Implemented:

- Provider identity/business card.
- Real profile photo display.
- Category and service area.
- Rating, review count and experience when the dashboard supplies it.
- Real availability switch with optimistic UI and rollback on API failure.
- About section.
- Real business-gallery display with cover indication and full-screen viewer.
- Real edit-business-profile bottom sheet for business name, owner name, business email and About.
- Edit saves through `PUT /api/provider/profile` and preserves the existing verified location coordinates and WhatsApp value without exposing WhatsApp in the UI.
- Current service area is read-only in this editor so this build does not bypass the backend's verified location flow.
- Standard / Localsewa+ state is driven by the real membership API.
- My Services and Reviews workspace shortcuts.
- Existing Provider → Customer workspace-transition popup is preserved.
- Sign out.

Business/profile photo upload and gallery mutation are not enabled in this first Provider build. Existing backend photos are displayed only.

### 4. Provider Reviews

Connected to:

- `GET /api/provider/reviews`

The real existing web/backend contract supplies a `reviews` array with fields used by the Provider workspace such as:

- `id`
- `customer`
- `service`
- `rating`
- `comment`
- `created_at`

Implemented:

- Overall rating computed from the returned real review list.
- Total review count from the returned list.
- Customer/service/rating/comment/date cards.
- Loading skeletons.
- Pull-to-refresh.
- Error + retry state.
- Empty state.
- Read-only behavior.

Rating-distribution, reply and report actions are deliberately not invented because the currently inspected Provider review contract does not provide those capabilities.

## Localsewa+ behavior

`GET /api/provider/premium` is consumed through its real `membership` field.

- `TRIAL` / `ACTIVE` plus authoritative `active=true` enables premium Provider theme/chrome.
- Expired access falls back to Standard Provider UI.
- Localsewa+ does **not** create a separate navigation tree.

## Existing role switching preserved

Customer → Provider and Provider → Customer still use the existing transition modal before the workspace changes.

Provider transition copy remains:

- `SWITCHING WORKSPACE`
- `Provider mode`
- `Preparing your business workspace…`

Customer transition copy remains:

- `SWITCHING WORKSPACE`
- `Customer mode`
- `Preparing your customer workspace…`

## Main changed/new files

- `android/app/build.gradle`
- `src/api/providerWorkspaceApi.ts`
- `src/app/AppShellProvider.tsx`
- `src/components/provider/ProviderHeader.tsx`
- `src/components/provider/ProviderNotificationsModal.tsx`
- `src/components/provider/index.ts`
- `src/hooks/useProviderWorkspace.ts`
- `src/navigation/ProviderTabs.tsx`
- `src/screens/provider/ProviderHomeScreen.tsx`
- `src/screens/provider/ProviderProfileScreen.tsx`
- `src/screens/provider/ProviderReviewsScreen.tsx`
- `src/types/providerWorkspace.ts`

## Android Studio GUI test checklist

Use an Android emulator/virtual device only.

1. Open this project in Android Studio.
2. Let Gradle sync complete.
3. Select the existing Android emulator from Device Manager.
4. Run the app from the Android Studio Run button.
5. Sign in with an account that has the Provider role.
6. Switch Customer → Provider and confirm the existing workspace transition popup appears first.
7. Confirm the Provider header shows the Provider workspace, correct Standard/Plus state and notification bell.
8. Confirm bottom tabs read `Dashboard | Requests | Services | Reviews | Profile`.
9. Open Profile and verify real business name/category/location/photos/review count load from the account.
10. Toggle availability and reopen/refresh Profile to verify persistence.
11. Edit business name/About (and other supported edit fields), save, refresh, and verify persistence.
12. Open a business photo and close the full-screen viewer.
13. Open Reviews and verify real customer reviews, pull-to-refresh, empty/error behavior as applicable.
14. Switch Provider → Customer and confirm the transition popup appears before the Customer workspace.
15. Regression-check Customer Home, Services, Bookings and Profile. Their UI source was not changed by this build.

## Verification completed before packaging

- Reconstructed v1.10.45 was used as the source baseline.
- Provider API usage was cross-checked against the existing Provider web source/backend route inventory rather than guessed endpoints.
- All changed TypeScript/TSX files passed syntax transpilation checks.
- Provider icon literals were checked against the existing shared AppIcon registry.
- No file under `src/screens/customer` or `src/components/customer` differs from v1.10.45.
- ZIP integrity is checked after packaging.

A live authenticated emulator/backend end-to-end run is still the acceptance gate on the user's Android Studio environment.
