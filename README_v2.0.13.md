# Localsewa Android v2.0.13 — Provider Profile Media Manager Hotfix

Apply this incremental patch on top of **v2.0.12**.

## Provider Profile cleanup
- Removed the duplicate AVAILABLE / UNAVAILABLE badge beside the business name.
- The separate **Available for work** card remains the single live availability control/status surface.
- Compacted Rating / Reviews / Experience into a denser stats row.
- Reduced the vertical gap between the stats row and About.
- Reduced Profile card internal vertical padding without changing the locked Provider design language.
- Added **Manage photos** to Provider workspace options.

## Business photo manager
Tapping a business gallery photo, or opening **Manage photos**, now opens a dedicated media manager:
- large selected-photo preview;
- thumbnail previews for all business photos (maximum 5);
- Add photo;
- Move photo to first position;
- Delete photo;
- selected-thumbnail state;
- photo count.

Business photo mutations use the existing Provider media APIs. The backend exposes a first/cover operation rather than an arbitrary reorder endpoint, so **Move** means persistently move the selected photo to the first position. No fake local-only reorder is used.

## Media overlay
- The old nearly-black fullscreen viewer is replaced by a lighter media overlay.
- Provider UI behind the overlay uses React Native native blur on supported Android/New Architecture devices.
- The close control is aligned to the same right/top inset used by the Provider header action area instead of floating near the notch.

## Provider profile photo manager
Tapping the Provider profile photo now shows:
- Change photo
- Remove photo

These two controls intentionally do not mutate the backend yet:
- native profile-photo upload remains paused until server-side metadata/EXIF stripping is enforced for ordinary image uploads;
- the current backend has no profile-photo removal endpoint.

The controls explain the limitation instead of silently failing or using an unsafe/fake operation.

## Scope note
This patch adds the real **Manage photos** Profile option. Account Security / App Settings / Help & Support are not added as dead rows because the current Provider navigator does not yet expose those secondary destinations. They should be wired in a dedicated Provider secondary-navigation patch.

## Version
- versionName: 2.0.13
- versionCode: 20013
