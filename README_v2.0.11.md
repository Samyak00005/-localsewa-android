# Localsewa Android v2.0.11 Hotfix

Apply this patch over v2.0.10 and overwrite matching paths.

## Provider Profile
- Removed the business-gallery `Cover` tag.
- Replaced the top-right gallery view glyph with a functional `Add photos` action.
- Keeps the existing fullscreen photo tap behavior and gallery counter.
- Premium Provider profile-photo ring increased from 2dp to 3dp.
- `Edit business profile` upgraded to a 52dp pill/rounded action.

## Provider Services
- Replaced the Services placeholder with the real Provider Services workspace.
- Uses GET/POST `/api/provider/services`, PUT/DELETE `/api/provider/services/{id}`.
- Supports add, edit and remove service flows with real query invalidation.
- Uses the current Provider dashboard category and real categories list.
- Standard Provider category stays locked; active Localsewa+ can update via PUT `/api/provider/category`.
- Includes loading, empty, error and pull-to-refresh states.
- Uses the locked Provider palette and 28dp major-surface radius.

## Customer pull-to-refresh
Added pull-to-refresh to all five Customer root tabs:
- Home
- All services
- Bookings
- Saved
- Profile

Existing Customer layouts and navigation remain unchanged.

## Version
- versionName: 2.0.11
- versionCode: 20011
