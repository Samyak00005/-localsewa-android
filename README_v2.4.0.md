# Localsewa Android v2.4.0 — Provider Account & Settings Feature Patch

Apply this incremental feature patch on top of v2.3.1.

## Provider Profile — common account/app/legal options
- Added **Account & settings** section with Account security.
- Added **App settings** section:
  - App language (same current behavior as Customer: English selected)
  - App theme (same current behavior as Customer: Light selected)
  - Notifications (opens the Provider notification tray)
- Added **Help & legal** section:
  - Help & Support
  - Terms & Conditions
  - Privacy Policy
- Customer-only Default location is intentionally not duplicated in Provider Profile because Provider business/service location is managed separately.

## Provider secondary account screens
- Added Provider Account Security route/screen with Provider chrome.
- Existing password change/set flows remain real and reuse current authenticated account-security APIs.
- Added Sign out all devices.
- Added Provider Account Deletion route/screen using the existing verified password / email-OTP deletion lifecycle.
- Added Provider-native Help & Support, Terms & Conditions and Privacy Policy screens.

## Logout consistency
- Added a shared `ProfileLogoutAction` component.
- Provider logout now uses the same neutral Customer logout-card treatment instead of the old destructive red button.
- Customer and Provider logout content is now centered as one icon/text group.
- Logout behavior itself is unchanged.

## Preserved behavior
- Provider workspace switch styling/behavior unchanged.
- Localsewa+ membership/theme controls unchanged.
- Customer profile layout/options unchanged except the centered logout presentation.
- No backend/API contract changes.

## Version
- versionName: 2.4.0
- versionCode: 20400
