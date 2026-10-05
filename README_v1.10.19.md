# Localsewa Android v1.10.19 — v1.10.18 Build Hotfix

## Base

Apply this hotfix over:

```text
v1.10.18 — Account Security Popup Flows
```

No npm install is required.

## Why this hotfix exists

The release build started failing at:

```text
:app:createBundleReleaseJsAndAssets
Process 'command 'cmd'' finished with non-zero exit value 1
```

immediately after v1.10.18.

The visible Gradle message is only the wrapper failure, not the original Metro
error. Because v1.10.18 also physically removed three Customer security screen
files/routes, this hotfix removes that structural risk first.

## Hotfix strategy

v1.10.19 keeps the new Account Security UX:

- Change password opens the popup
- Set password opens the popup
- Change account email stays hidden from the Android UI
- Email/mobile remain non-editable
- Need Help remains at the bottom

But it restores the old screen modules internally as compatibility files:

```text
ChangePasswordScreen.tsx
SetPasswordScreen.tsx
ChangeEmailScreen.tsx
```

Their route/type/export contracts are restored so Metro cannot fail because of
a stale or cached module reference.

These pages are NOT linked from the current Account Security UI.

The user-facing flow still uses the v1.10.18 popup.

## Important

Do NOT delete these three files after applying v1.10.19:

```text
src/screens/customer/ChangePasswordScreen.tsx
src/screens/customer/SetPasswordScreen.tsx
src/screens/customer/ChangeEmailScreen.tsx
```

They remain internal compatibility modules for now.

## Email/mobile policy remains unchanged

The Android UI still does not allow users to change:

```text
Account email
Linked mobile number
```

Edit Profile preserves the linked mobile number but does not expose it as an
editable field.

The restored Change Email module is not exposed through the Account Security
screen.

## Password popup remains

Account Security still uses:

```text
PasswordSecurityModal
```

for:

```text
Change password
Set a password
```

No user action navigates to the restored legacy password screens.

## Supporting compatibility restored

To avoid partial old/new module graphs, this hotfix also restores the original
account-security API/hook methods and the three route contracts internally.

This does not change the visible Account Security page.

## Validation performed

Before packaging, the hotfix was merged over the current Customer source
snapshot and checked for:

```text
Missing relative imports: 0
TypeScript/TSX syntax errors: 0
```

## Files included

```text
src/components/account/PasswordSecurityModal.tsx
src/components/account/index.ts

src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/EditCustomerProfileScreen.tsx
src/screens/customer/ChangePasswordScreen.tsx
src/screens/customer/SetPasswordScreen.tsx
src/screens/customer/ChangeEmailScreen.tsx
src/screens/customer/index.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/hooks/useAccountSecurity.ts
src/api/accountSecurityApi.ts
```

## Install

1. Keep the current v1.10.18 project.
2. Extract/copy this ZIP into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Choose Replace for the included files.
4. Do NOT delete any of the three restored compatibility screen files.
5. Do NOT run npm install.
6. In Android Studio use:

```text
Build -> Clean Project
```

then:

```text
Build -> Rebuild Project
```

or run the normal app configuration.

## Expected Account Security behavior

User-facing UI remains:

```text
Account security

Account email

PASSWORD
Change password -> popup
Set a password -> popup

SESSIONS
Sign out all devices

ACCOUNT
Delete account

Need help with account security? Get help
```

`Change account email` remains absent.

## If release build still fails

If `createBundleReleaseJsAndAssets` still fails after this compatibility
hotfix, the root cause is not the removed screen modules. In that case capture
the first Metro/JavaScript error above the Gradle wrapper message; do not change
Gradle versions or dependencies.
