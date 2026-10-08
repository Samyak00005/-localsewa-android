# Localsewa Android — Provider Regression QA

**Audited baseline:** v2.4.0 / versionCode 20400  
**QA hotfix produced:** v2.4.1 / versionCode 20401  
**Scope:** Provider workspace only, plus shared cache/notification/chat logic needed for Provider correctness.

## QA status legend

- **PASS (static):** verified from the effective reconstructed v2.4.0 source and backend contract.
- **FIXED v2.4.1:** code-confirmed regression found in v2.4.0 and repaired in this patch.
- **UAT REQUIRED:** cannot be honestly closed without real API/account/device interaction.
- **DEFERRED:** intentionally outside the current Provider release scope.

## 1. Core Provider navigation

| Check | Status | Notes |
|---|---|---|
| Dashboard / Requests / Services / Reviews / Profile tabs exist | PASS (static) | Final 5-tab Provider navigation is present. |
| Request Details secondary route | PASS (static) | Booking ID is required by route params. |
| Provider Chat secondary route | PASS (static) | Booking-scoped route is present. |
| Account Security / Deletion / Help / Terms / Privacy routes | PASS (static) | Provider stack has dedicated screens. |
| Provider → Customer workspace switch uses transition modal | PASS (static) | Existing workspace transition is preserved. |
| Customer → Provider notification destination survives workspace switch | FIXED v2.4.1 | Pending Provider target is now carried through the workspace transition. |

## 2. Booking request lifecycle

Backend transition matrix used by Android:

- PENDING → ACCEPTED / REJECTED
- ACCEPTED → IN_PROGRESS / REJECTED
- IN_PROGRESS → COMPLETED / NOT_COMPLETED
- REJECTED and NOT_COMPLETED require a reason.

| Check | Status | Notes |
|---|---|---|
| Pending → Accept | PASS (static) | UI action maps to ACCEPTED. |
| Pending → Reject | PASS (static) | Reason flow is required. |
| Accepted → Start job | PASS (static) | Maps to IN_PROGRESS. |
| Accepted → Reject | PASS (static) | Reason flow is required. |
| In Progress → Complete | PASS (static) | Maps to COMPLETED. |
| In Progress → Not completed | PASS (static) | Reason flow is required. |
| Status mutation invalidates Requests count, bookings and Dashboard | PASS (static) | Shared Provider mutation invalidation is present. |
| Two-account state propagation | UAT REQUIRED | Must be tested Customer ↔ Provider against live backend. |

## 3. Dashboard freshness

| Check | Status | Notes |
|---|---|---|
| Manual pull-to-refresh | PASS (static) | Manual spinner remains gesture-only. |
| Refresh on screen focus | PASS (static) | Existing focus refresh retained. |
| Dashboard and active-work data converge while screen stays open | FIXED v2.4.1 | Focus-scoped 30-second silent refresh added for dashboard/request count/bookings. |
| New request appears without user pull | UAT REQUIRED | Verify with second Customer account while Dashboard stays open. |

## 4. Requests freshness

| Check | Status | Notes |
|---|---|---|
| Detailed status filters | PASS (static) | All/Pending/Accepted/In Progress/Completed/Rejected/Not Completed/Cancelled. |
| Manual pull-to-refresh | PASS (static) | Manual spinner only. |
| Request list updates while screen stays open | FIXED v2.4.1 | Focus-scoped 30-second silent refresh added. |
| Filter/card moves immediately after status mutation | UAT REQUIRED | Verify real backend transition and server response. |

## 5. Services resilience and CRUD

| Check | Status | Notes |
|---|---|---|
| Real GET/POST/PUT/DELETE service APIs | PASS (static) | No mock catalogue path found. |
| Successful service catalogue survives dashboard/category supporting failure | FIXED v2.4.1 | Supporting errors no longer replace valid services with a full-page error. |
| Add/Edit/Delete invalidates public Provider caches | PASS (static) | Provider list/detail invalidation exists. |
| Premium category action requires supporting data | FIXED v2.4.1 | Change control disables when category/profile dependencies are unavailable. |
| CRUD persistence | UAT REQUIRED | Add/edit/remove a real service and relaunch app. |

## 6. Profile and availability

| Check | Status | Notes |
|---|---|---|
| Availability optimistic update with rollback | PASS (static) | Failed mutation restores previous Dashboard data. |
| Availability/profile edit refresh Customer-side Provider directory/detail cache | FIXED v2.4.1 | Public provider queries are now invalidated. |
| Business photo add/delete | PASS (static) | Real provider media endpoints wired. |
| Persistent arbitrary photo reorder | DEFERRED | Backend lacks arbitrary sort-order update route. |
| Native profile-photo Change/Remove | DEFERRED | Keep disabled until media privacy/EXIF pipeline and remove contract are safe. |

## 7. Reviews

| Check | Status | Notes |
|---|---|---|
| Provider Reviews uses real endpoint | PASS (static) | Read-only Provider review feed. |
| Customer review invalidates public directory/highlights | PASS (static) | Existing behavior retained. |
| Customer review invalidates Provider Reviews/Dashboard | FIXED v2.4.1 | Cross-workspace cache invalidation added. |
| Provider Reviews refreshes on tab focus | FIXED v2.4.1 | Focus refresh added. |
| Review appears after completed booking | UAT REQUIRED | Complete → customer review → switch Provider → verify aggregate/list. |

## 8. Notifications

| Check | Status | Notes |
|---|---|---|
| Provider tray filters Provider notifications | PASS (static) | Shared notification feed remains role-filtered. |
| Mark one/read-all behavior | PASS (static) | Provider-only read-all loops only through Provider notifications. |
| Provider notification tap opens target | FIXED v2.4.1 | Dashboard, Requests, Request Details and active Chat destinations are mapped. |
| Cross-workspace Provider notification target retained | FIXED v2.4.1 | Customer tray passes destination through workspace transition. |
| Chat notification falls back to Request Details when chat is no longer active | FIXED v2.4.1 | Provider tray checks current booking state. |
| Real notification action URLs | UAT REQUIRED | Test actual new request/message/status notifications from backend. |
| FCM/background/killed-app push | DEFERRED | Backend/device-token push layer still not implemented. |

## 9. Chat

| Check | Status | Notes |
|---|---|---|
| Booking-scoped history/send | PASS (static) | Uses real booking message APIs. |
| Automatic POST retry disabled | PASS (static) | Required because message POST is not idempotent. |
| Late poll around send | FIXED/HARDENED v2.4.1 | Current chat query is cancelled before send; fresh history is invalidated after success. |
| Slow/out-of-order polling, reconnect and duplicate response | UAT REQUIRED | Must be forced on real/network-throttled devices. |
| Chat closes correctly after booking leaves ACCEPTED/IN_PROGRESS | UAT REQUIRED | Verify backend permission change while screen is open. |

## 10. Call controls

| Check | Status | Notes |
|---|---|---|
| Call entry appears only for active communication state | PASS (static) | Accepted/In Progress gating is preserved. |
| Call preview screen | PASS (static) | Explicitly preview-only. |
| Real WebRTC/audio/microphone/incoming-call lifecycle | DEFERRED | Separate major integration. |

## 11. Account & settings

| Check | Status | Notes |
|---|---|---|
| Provider Account Security route | PASS (static) | Password/session/delete controls wired. |
| Provider Help / Terms / Privacy | PASS (static) | Dedicated Provider chrome routes. |
| Shared centered logout component | PASS (static) | Customer and Provider reuse same neutral logout component. |
| Sign out this device / all devices | UAT REQUIRED | Verify session revocation against real token store. |
| Account deletion 30-day lifecycle | UAT REQUIRED | Verify password + Google-only OTP paths and login cancellation. |

### Important backend policy risk

For a Provider with an active Localsewa+ subscription, the existing backend audit found that account deletion scheduling revokes sessions immediately, but gateway cancellation occurs at final deletion rather than necessarily at the start of the 30-day grace period. Before release, test/decide the renewal policy and ensure the UI copy matches it.

## 12. Localsewa+

| Check | Status | Notes |
|---|---|---|
| Entitlement drives Provider tier | PASS (static) | Premium is not treated as a separate role. |
| Normal/premium visual preference persists | PASS (static) | Effective v2.4.0 AppShell contains stored preference support. |
| Category change gated by premium | PASS (static) | Backend entitlement still authoritative. |
| Trial/paid expiry boundary while app remains open | UAT REQUIRED | Membership polling exists; verify visual fallback when entitlement expires. |
| Full native subscription management/checkout | DEFERRED | Separate phase. |

## 13. Required real-device UAT sequence

Run with **two separate test accounts/devices** where possible:

1. Customer creates a booking while Provider remains on Dashboard.
2. Confirm Provider pending count + Needs Attention/list converge without manual pull (allow up to 30 s).
3. Open Requests; verify the booking and Request Details.
4. Accept the booking; verify Customer becomes Accepted and Chat/Call unlock.
5. Send Customer → Provider and Provider → Customer messages; throttle/reconnect network during one send.
6. Open notification from Provider workspace and verify exact destination.
7. Switch to Customer workspace and tap a Provider notification; verify transition then exact Provider destination.
8. Start job → verify In Progress on both sides.
9. Complete one booking; run a second booking through Not Completed + reason.
10. Run another Pending booking through Reject + reason.
11. Customer cancels one eligible booking and verify Provider screens converge.
12. Customer reviews a Completed booking; switch Provider and verify Dashboard/Reviews update.
13. Toggle Provider availability; switch Customer and verify Provider directory/detail reflect it.
14. Add/Edit/Delete a service; relaunch and verify persistence.
15. Test Provider Account Security/logout/delete-request paths on real backend.

## Result after static QA

**v2.4.0 was not declared production-QA passed.** Static/source QA found concrete refresh, notification-routing, cache-consistency and partial-failure issues. Those are repaired/hardened in **v2.4.1**. The remaining items above require real backend/device UAT before Provider can be called release-ready.
