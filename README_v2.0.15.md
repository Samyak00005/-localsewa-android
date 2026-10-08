# Localsewa Android v2.0.15 — Services / Reviews / Media Viewer polish hotfix

Apply this incremental patch on top of v2.0.14.

## Included

- Services Business Category card now uses a 16:9 information-card ratio.
- Reviews Overall Rating card now uses the same 16:9 ratio.
- Services and Reviews keep the same white/surface card treatment for visual consistency.
- Provider service cards are more compact: tighter padding, smaller service icon tile, tighter description spacing, two-line description cap and shorter action row.
- Provider review mapper now reads customer profile image fields (snake_case, camelCase and nested customer variants), normalizes relative media URLs, and passes them to the review avatar. Initials remain the fallback when no customer image is supplied.
- Business media viewer background uses a stronger blur plus a dark blue/navy scrim.
- Business media viewer supports horizontal swipe/paging and keeps thumbnail selection synchronized with the large preview.
- Add action moved to the Business photos tray header.
- Removed the “Tap a preview to select” helper.
- Replaced the old single Move control with Move left / Move right preview navigation controls.
- Version: 2.0.15 / versionCode 20015.

## Backend note

The existing backend exposes add, delete and cover-selection routes for Provider business images, but no arbitrary left/right persistent reorder route is confirmed. Therefore Move left / Move right in this hotfix navigate the selected media preview rather than pretending to persist an unsupported gallery order.
