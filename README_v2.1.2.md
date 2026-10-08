# Localsewa Android v2.1.2 — Dashboard Actions + Manual Refresh Hotfix

Base: v2.1.1

## Provider Dashboard
- Active Work cards now expose Chat and Call actions only while the backend booking state allows communication.
- Chat opens a provider-side booking chat screen using the existing real booking-message API.
- Call opens the existing preview-only call experience; production WebRTC/audio remains deferred.
- Repetitive dashboard section subtitles were removed; headings remain concise.
- Four top stat cards were refined with a larger icon and the metric value beside the icon.

## Pull-to-refresh behavior
- Pull-to-refresh spinner is now manual-only.
- Focus refresh, interval refresh, query invalidation, navigation refresh and background refetch do not activate the pull spinner.
- Applied consistently to current Customer root tabs and Provider Dashboard / Services / Reviews / Profile.
- Existing skeletons, retry button loading states and data refresh behavior remain intact.

## Navigation
- Added a lightweight Provider stack wrapper for provider booking chat and provider voice-call preview routes.

## Version
- versionName: 2.1.2
- versionCode: 20102
