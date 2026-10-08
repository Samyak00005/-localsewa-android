# Localsewa Android v2.3.1 — Provider Notification Tray Parity Hotfix

Apply this incremental hotfix on top of v2.3.0.

## Provider notification tray
- Rebuilt Provider notifications modal using the same floating tray system as Customer notifications.
- Same 8dp screen margin, 26dp full sheet radius, surface/shadow treatment and lighter backdrop.
- Uses the same native NotificationBackdrop blur behavior as the Customer tray.
- Clean header and circular close action.
- Added Provider-scoped unread count and `Mark all read` action.
- Notifications are grouped by date.
- Replaced the older icon-heavy rows with the same compact title/time/message card hierarchy used by Customer notifications.
- Provider emerald read/unread treatment retained.
- Provider filtering remains intact; Customer notifications do not appear in this tray.
- Loading, retry/error and empty states now follow the Customer tray structure.
- Removed the Provider tray's independent pull-to-refresh UI; the existing notifications query continues foreground polling automatically.

## Version
- versionName: 2.3.1
- versionCode: 20301
