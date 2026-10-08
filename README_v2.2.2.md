# Localsewa Android v2.2.2 — Requests Clean Card UI Hotfix

Apply this patch over **v2.2.1**.

## What changed

- Preserved the richer request data added in v2.2.1.
- Reworked Provider request cards into a native-first, compact information hierarchy.
- Removed website-style section boxes/labels such as PRIVATE COMMUNICATION and SERVICE LOCATION.
- Removed the Pending communication-unlock helper box.
- Customer identity is now a simple avatar/name row instead of a large tinted strip.
- Date and time are presented as compact inline facts.
- Location is a single clean row with optional distance and compact Route action.
- Closed-location state is a simple muted lock row.
- Customer notes are shown as plain information rows.
- Reject / Not Completed / Cancelled reasons use one small contextual warning row.
- Completed reviews use one compact rating/review block.
- Chat and Call are secondary actions only for eligible active bookings.
- Lifecycle actions remain the strongest bottom action row.
- Removed the repetitive Service Requests subheading.

## Behaviour preserved

- Real provider booking data and status filters.
- Accept / Reject / Start job / Complete / Not completed backend mutations.
- Mandatory reason flow for Reject and Not completed.
- Real booking chat entry point.
- Call remains the existing preview-only flow; real WebRTC audio is still deferred.
- Pull-to-refresh and silent focus refresh.

## Version

- versionName: `2.2.2`
- versionCode: `20202`
