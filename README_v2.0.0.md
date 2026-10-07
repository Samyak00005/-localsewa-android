# Localsewa Android v2.0.0 — Provider Workspace Foundation

## Base

Apply over:

`v1.10.45 — Provider Gallery Width Hotfix`

This is the first Provider-role milestone after the Customer-role UI pass.

The Android app remains an independent React Native + TypeScript application.
No WebView is introduced.

No npm install is required.

## Scope

This milestone intentionally implements the lightweight Provider foundation
first:

1. Provider header
2. Provider bottom navigation
3. Provider Profile
4. Provider Reviews

The following existing Provider tab routes remain placeholders for the next
milestones:

- Home / Dashboard
- Requests
- Services

This avoids prematurely designing the major operational pages before the
Provider visual language is approved.

## Provider bottom navigation

Final primary Provider tabs:

- Home
- Requests
- Services
- Reviews
- Profile

This matches the Provider navigation plan.

The bottom bar now follows the same safe-area behavior as the polished Customer
bar while using Provider theme tokens.

Standard Provider uses the existing dark forest Provider palette.

Localsewa+ continues to use the same route tree. It is not a third role.

## Provider header

New shared header:

- Localsewa mark
- `PROVIDER WORKSPACE`
- `Manage your local business`
- Standard / Localsewa+ workspace tier pill

Standard uses Provider dark forest green.

Premium mode automatically uses premium theme tokens and a gold tier treatment.

No hamburger/drawer is added.

Provider Notifications are deliberately not faked in this build; notification
routing will be connected during the Requests/communication phase.

## Provider Profile

The placeholder Profile is replaced with a real Provider workspace page.

### Data source

`GET /api/provider/dashboard`

The parser tolerates common backend nesting patterns while never inventing
provider data.

Displayed when returned by the backend:

- business/provider name
- profile image
- category
- location
- availability
- rating
- review count
- experience
- About/business description

Auth account name/photo is only used as a safe identity fallback if the
provider dashboard omits those fields.

### Workspace options

Functional now:

- Services -> Provider Services tab
- Reviews -> Provider Reviews tab
- Switch to Customer -> existing workspace transition flow
- Sign out

Shown as explicit next-phase entries:

- Localsewa+ membership management
- Account security Provider-stack connection
- Help & Support Provider-stack connection

These entries do not pretend the missing Provider secondary routes are already
complete.

## Provider Reviews

The placeholder Reviews page is replaced with a real read-only feedback page.

### Data source

`GET /api/provider/reviews`

Displayed:

- average rating
- total reviews
- 5-star count
- 5-to-1 rating distribution
- recent customer feedback
- customer name when supplied
- service name when supplied
- rating
- comment
- booking code when supplied
- date when supplied

No fake reviews are inserted.

If there are no reviews, a real empty state is shown.

Pull-to-refresh and retry/error states are included.

## New files

- `src/types/providerWorkspace.ts`
- `src/api/providerWorkspaceApi.ts`
- `src/hooks/useProviderWorkspace.ts`
- `src/components/provider/ProviderHeader.tsx`
- `src/components/provider/index.ts`

## Replaced files

- `src/navigation/ProviderTabs.tsx`
- `src/screens/provider/ProviderProfileScreen.tsx`
- `src/screens/provider/ProviderReviewsScreen.tsx`
- `src/screens/provider/index.ts`
- `android/app/build.gradle`

## Backend routes used

- `GET /api/provider/dashboard`
- `GET /api/provider/reviews`

Both are authenticated Provider routes in the current Hostinger backend.

No new backend endpoint is invented.

## Android version

- versionCode: 20000
- versionName: 2.0.0

## Install

Apply over v1.10.45.

No npm install.

No Kotlin/native source changes are included, so normal Android Studio Run is
enough.

## QA

### Provider workspace entry

Switch Customer -> Provider.

Confirm:

- existing Switching Workspace popup appears first
- Provider header appears
- Provider bottom navbar appears

### Header

Check:

- Localsewa logo
- Provider workspace copy
- Standard tier
- no hamburger
- premium theme still has an intentional visual path

### Navbar

Confirm:

- Home
- Requests
- Services
- Reviews
- Profile
- active state follows selected tab
- Android bottom safe area is respected

### Profile

Check:

- real dashboard/profile data where available
- circular profile image
- category/location
- availability
- Rating / Reviews / Experience
- About
- Services row opens Services tab
- Reviews row opens Reviews tab
- Switch to Customer shows transition popup and switches workspace
- Sign out works

### Reviews

Check:

- summary loads from real Provider reviews API
- distribution bars render
- customer review cards render
- pull-to-refresh works
- empty state works for zero reviews
- backend/network error has Retry

## Next Provider milestone

After visual approval of this foundation:

`v2.1.0 — Provider Services`

Then:

`v2.2.0 — Provider Dashboard`
`v2.3.0 — Provider Requests`
`v2.4.0 — Provider Request Details & Lifecycle`

Localsewa+ entitlement UI and shared Provider secondary settings will follow
after the core operational workflow is stable.
