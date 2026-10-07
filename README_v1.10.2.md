# Localsewa Android v1.10.2 — Navigation & Icon System Polish

## Summary

v1.10.2 removes the remaining temporary navigation/action glyphs from the
current Android UI and establishes one shared production vector-icon system.

This is a visual/navigation polish release. It does not change backend
business logic.

## New dependency

Install once from the Android Studio Terminal at the project root:

```powershell
npm install lucide-react-native react-native-svg
```

Project root:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

`react-native-svg` is autolinked by React Native. No manual Gradle dependency
entry is required.

## Shared icon system

Added:

```text
src/components/icons/AppIcon.tsx
src/components/icons/index.ts
```

Standard sizes:

```text
XS 16
SM 20
MD 24
LG 28
XL 32
```

Screens use the Localsewa theme for icon color rather than hardcoding
Customer/Provider role colors into the icon component.

## Customer bottom navigation

Temporary:

```text
H
S
B
★
P
```

is replaced by:

```text
Home      → Home
Services  → Wrench
Bookings  → Calendar
Saved     → Bookmark
Profile   → User
```

Selected state keeps Customer green with a soft selected icon background.

## Provider bottom navigation

The Provider shell is standardized before v2.0.0:

```text
Home      → Home
Requests  → Calendar
Services  → Wrench
Reviews   → Star
Profile   → User
```

Provider Standard and Localsewa+ keep their existing theme behavior.

Localsewa+ remains a Provider entitlement, not a separate role.

## Password inputs

Temporary Show/Hide text is replaced with:

```text
Eye
Eye Off
```

Accessibility labels remain `Show password` / `Hide password`.

## Customer Home

Top-right `Alerts` text control becomes a real Bell icon.

Unread count remains attached to the Bell.

## Notifications

Notification rows now use contextual icons:

```text
Chat/message → Message
Booking      → Calendar
Security     → Shield Check
Other        → Bell
```

A proper right Chevron is also added.

## Chat

Booking Chat now uses:

```text
Phone icon → call UI preview
Send icon  → message send
```

Temporary telephone/text send controls are removed.

Real calling remains ON HOLD.

## Call UI preview

Temporary:

```text
M
M+
S
```

controls are replaced by:

```text
Mic
Mic Off
Speaker
Speaker Off
Phone Off
```

These are still UI-only states. No microphone/WebRTC/audio routing is enabled.

## Booking Details

Important actions now use icons:

```text
Open chat      → Message
Call           → Phone
Open location  → Map Pin
Rate service   → Star
Rebook         → User
Cancel booking → Trash
```

## Ratings

Unicode rating stars are replaced in the active Customer UI:

- Provider cards
- Provider Details review list
- Booking Review selector

Selected review stars use a filled vector state.

## Profile & settings

Settings rows support a standard leading icon and trailing Chevron.

Customer Profile uses:

```text
Edit profile       → User Edit
Default location   → Map Pin
Account security   → Shield Check
Help & Support     → Help
Terms              → File
Privacy            → Shield
Delete account     → Trash
Switch to Provider → Briefcase
```

Account Security uses:

```text
Change password → Key
Set password    → Lock
Change email    → Mail
```

## Accordions

Temporary `+ / −` expansion glyphs are replaced by:

```text
Chevron Down
Chevron Up
```

Help, Terms and Privacy sections also receive consistent section icons.

## Shared Button

`Button` now supports optional vector icons:

```ts
icon?: AppIconName
iconPosition?: 'left' | 'right'
```

All old button calls remain valid.

## Touch targets

Production interaction targets are standardized:

- notification Bell: 48dp
- chat Call: 48dp
- chat Send: 48dp
- password eye: visual 40dp + hit slop
- bottom tab bar: 72dp high

## Navigation policy

No route hierarchy is changed.

No page-level `Back to ...` control is added.

Android/system/navigation Back remains the expected secondary-page navigation.

## Files added

```text
src/components/icons/AppIcon.tsx
src/components/icons/index.ts
```

## Files replaced

```text
src/components/ui/Button.tsx
src/components/auth/PasswordInput.tsx

src/navigation/CustomerTabs.tsx
src/navigation/ProviderTabs.tsx

src/components/account/SettingsRow.tsx
src/components/account/AccordionCard.tsx

src/components/customer/SectionHeader.tsx
src/components/customer/NotificationRow.tsx
src/components/customer/ProviderCard.tsx

src/screens/customer/CustomerHomeScreen.tsx
src/screens/customer/BookingDetailsScreen.tsx
src/screens/customer/BookingChatScreen.tsx
src/screens/customer/VoiceCallPreviewScreen.tsx
src/screens/customer/BookingReviewScreen.tsx
src/screens/customer/ProviderDetailsScreen.tsx

src/screens/customer/CustomerProfileScreen.tsx
src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/HelpSupportScreen.tsx
src/screens/customer/TermsConditionsScreen.tsx
src/screens/customer/PrivacyPolicyScreen.tsx
```

## Install steps

1. Copy/replace the v1.10.2 ZIP contents in the current project.
2. Open Android Studio Terminal.
3. Confirm it shows the project root:
   `E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp`
4. Run:
   `npm install lucide-react-native react-native-svg`
5. Wait for install/indexing.
6. Run normally with Android Studio.

## QA checklist

### Customer tabs
- Home icon
- Services icon
- Bookings icon
- Saved icon
- Profile icon
- selected tab uses Customer green
- no H/S/B/★/P remains

### Provider tabs
- Home / Requests / Services / Reviews / Profile icons
- Provider Standard theme preserved
- Localsewa+ premium tab styling preserved

### Home
- Bell appears top-right
- unread badge appears correctly
- Bell opens Notifications

### Password
- eye/eye-off works
- secure entry behavior unchanged

### Notifications
- contextual icon visible
- chevron visible
- notification routing unchanged

### Chat
- top-right Phone icon
- bottom Send icon
- message sending unchanged
- Call opens preview only

### Call preview
- Mic / Mic Off
- Speaker / Speaker Off
- End Call icon
- no real audio starts

### Booking Details
- Chat/Call icons
- Map icon
- Review icon
- Cancel icon

### Ratings
- Provider cards use vector Star
- Provider Details review list uses vector Star
- Review picker uses vector filled Stars

### Profile
- settings icons aligned
- chevrons aligned
- Delete remains destructive
- Provider switch behavior unchanged

### Help / Terms / Privacy
- section icons consistent
- Chevron Up/Down expansion works
- Android Back works normally

## Closed by v1.10.2

The following item is now considered complete pending visual QA:

```text
Final navigation / shared icon system
```

## Still pending and necessary later

### Android push
- FCM
- device token backend
- server push sender
- Android permission/channel
- background/killed-app deep links

### Real voice calling
- WebRTC/signaling
- microphone
- real mute/speaker
- ringtone/incoming call lifecycle
- background calling

### Google Sign-In
- native Android OAuth
- final Android package/application identity
- same-account linking

### Profile photo
- backend EXIF/device metadata stripping
- Android image picker/upload

### Provider notification deep links
- complete after real Provider request/detail stack exists

## Next milestone

### v2.0.0 — Provider Workspace Foundation

Next:

```text
Provider Dashboard
Provider Requests
Request Details
Accept / Reject
In Progress
Complete / Not Completed
```

Then:

```text
Provider Services
Reviews
Provider Profile
Localsewa+ entitlement styling
```
