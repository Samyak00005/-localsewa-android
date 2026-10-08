# Localsewa Android v2.4.1 — Provider Regression QA Hotfix

Apply over **v2.4.0**.

## Fixed from the v2.4.0 static Provider regression pass

- Provider Services no longer hides a successful service catalogue when Dashboard/category supporting requests fail.
- Provider Dashboard silently refreshes dashboard/request-count/bookings every 30 seconds only while focused.
- Provider Requests silently refreshes booking/request-count data every 30 seconds only while focused.
- Provider notification taps now resolve to Dashboard, Requests, Request Details, or active Chat instead of only marking read.
- Provider notification destinations are preserved when the user taps them from Customer workspace and switches to Provider.
- Provider Chat notification falls back to Request Details if current booking state no longer allows chat.
- Provider profile edit and availability mutation invalidate Customer-side provider directory/detail caches.
- Customer review mutation invalidates Provider Reviews and Provider Dashboard caches.
- Provider Reviews refreshes when the tab receives focus.
- Chat send hardening cancels an older in-flight chat query before a non-idempotent message POST; automatic POST retry remains disabled.

## Validation performed

- Effective v2.4.0 source reconstructed from the locked full Provider baseline plus all incremental patches through v2.4.0 before auditing.
- 163 TS/TSX files passed TypeScript transpile/syntax diagnostics after the fixes.
- Notification target resolver tested with Provider requests/details/chat and Customer booking examples.
- Android version updated to `2.4.1` / versionCode `20401`.

## Not claimed as passed yet

Real two-account/device/backend UAT is still required for booking state propagation, slow-network chat race behavior, notifications, session revocation, account deletion and entitlement expiry. See `PROVIDER_REGRESSION_QA_v2.4.0.md`.
