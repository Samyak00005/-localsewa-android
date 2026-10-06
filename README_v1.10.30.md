# Localsewa Android v1.10.30 — Saved Provider API Hotfix

## Base

Apply over:

`v1.10.29 — App Settings & Workspace Transition`

No npm install.
No Android/Kotlin changes.

## Bug

On Home -> Services near you -> Save, the app showed:

`Saved providers`
`Provider not found.`

The provider was not saved.

## Root cause

The public provider reference itself was already in the correct format:

`provider-<profile-id>`

But the Android POST body used the wrong request key:

`provider_ref`

The saved-provider endpoint expects the public provider reference under:

`provider_id`

The earlier v1.10.28 normalization fixed the value format but did not fix this
request-field mismatch, so the backend still could not resolve the provider.

## Fix

Old request:

```json
{
  "provider_ref": "provider-12"
}
```

Fixed request:

```json
{
  "provider_id": "provider-12"
}
```

DELETE remains unchanged:

`DELETE /api/saved/{provider-ref}`

## File replaced

`src/api/customerApi.ts`

## Expected behavior

Home -> Services near you:

1. Tap `Save`.
2. Provider is persisted through the real `/api/saved` endpoint.
3. Saved Providers query is invalidated/refetched.
4. The provider appears in the Customer `Saved` tab.
5. The card updates to Saved state after the saved list refreshes.
6. Tapping Saved/unsave removes it using the existing DELETE endpoint.

The same API fix also applies anywhere else that uses the shared
`useSaveProvider()` hook, including the dedicated Services Near You screen.

## Install

1. Keep v1.10.29 as the current baseline.
2. Copy/replace this ZIP into your LocalsewaApp project.
3. No npm install.
4. No Clean/Rebuild needed.
5. Normal Android Studio Run is enough.

## QA

Test with DR developers and SN wiring:

- Save from Home
- Open Saved tab and confirm provider exists
- Return Home and confirm Saved state
- Unsave
- Confirm it disappears from Saved tab
- Save from dedicated Services Near You page too
