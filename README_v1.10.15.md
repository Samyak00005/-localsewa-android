# Localsewa Android v1.10.15 — Profile Refinement

Base: v1.10.14 Customer Profile UI Polish.

## Changes

1. Removed the top page heading:

`Profile`

2. Removed the top page subheading:

`Manage your account, location, security and support.`

The profile identity card now starts closer to the Customer header.

3. Moved `Delete account` into:

`ACCOUNT & SETTINGS`

New order:

- Default location
- Account security
- Delete account

Delete account keeps its destructive red styling and still opens the existing
`AccountDeletion` flow.

4. Removed the old isolated Delete account block from the bottom of the page.

5. Log out remains as the standalone bottom account action.

## File replaced

`src/screens/customer/CustomerProfileScreen.tsx`

## Install

Apply over v1.10.14.

No npm install is required.

## QA

Confirm:

- no Profile heading at the top
- no top explanatory subtitle
- profile identity card begins near the top
- Delete account appears inside Account & settings
- Delete account still opens the deletion flow
- Log out remains at the bottom
