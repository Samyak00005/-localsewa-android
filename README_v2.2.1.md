# Localsewa Android v2.2.1 — Provider Requests Data Parity & Lifecycle Hotfix

Apply this incremental patch on top of **v2.2.0**.

## Provider Requests improvements
- Preserves the clean native request-card composition while restoring operational data available on the website.
- Adds booking code, service/custom-service distinction and catalog starting price.
- Adds customer strip with real customer avatar when returned by the booking payload, otherwise initials fallback.
- Adds state-aware private Chat + Call controls for Accepted/In Progress bookings.
- Adds pending communication lock hint.
- Adds date/time, full returned service location, distance label and Maps route action when available.
- Adds closed-booking hidden-location message when exact customer location is no longer returned.
- Keeps customer note and outcome reason conditional.
- Adds completed customer review block with rating stars and optional review comment.
- Adds real provider booking lifecycle actions:
  - Pending -> Accept / Reject
  - Accepted -> Start job / Reject
  - In Progress -> Complete job / Not completed
- Reject and Not completed require a reason before confirmation.
- Status mutations use the real `/api/bookings/{id}/status` route and invalidate provider bookings, request count and dashboard caches.
- Detailed status filters remain and now include per-status counts.
- Manual pull-to-refresh behavior remains unchanged.

## API/parser hardening
- Booking parser now maps customer profile image fields across camelCase/snake_case variants.
- Added typed provider booking status-update helper.

## Deliberate boundary
- Real WebRTC calling is still deferred; Call opens the existing Provider voice-call preview flow.
- A native static-map preview is not invented here. The card exposes the real Maps route URL when the backend returns one.

Version: **2.2.1**  
Android versionCode: **20201**
