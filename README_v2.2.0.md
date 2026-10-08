# Localsewa Android v2.2.0 — Provider Requests

Incremental feature patch for the v2.1.4 baseline.

## Provider Requests
- Replaces the Provider Requests placeholder with a real provider-booking list.
- Uses the existing authenticated `GET /api/bookings?scope=provider` contract.
- Uses the existing `/api/provider/request-count` query for the freshest pending count.
- Adds compact Pending / Active / Completed summary cards.
- Adds horizontal status filters: All, Pending, Accepted, In progress, Completed, Rejected, Not completed, Canceled.
- Request cards show service, customer, status, date, time, service location, booking code, stored service price, optional customer note, and closed-state reason when present.
- `All` prioritizes Pending → Accepted → In progress before closed history, then sorts within each state by scheduled date/time.
- Manual pull-to-refresh refreshes both bookings and pending count.
- Screen focus refreshes data silently without showing the pull-to-refresh spinner.
- Loading, partial error, filtered-empty, and first-use empty states are included.

## Deliberately deferred
- Request Details screen.
- Accept / Reject actions.
- Start work / Complete / Not completed actions.
- Request-level Chat / Call entry points (Dashboard Active Work remains available).

These lifecycle actions will be added with Request Details so the list does not carry dead or duplicated controls.

## Version
- versionName: 2.2.0
- versionCode: 20200
