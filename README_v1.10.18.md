# Localsewa Android v1.10.18 — Account Security Popup Flows

## Base

Apply this build over:

```text
v1.10.17 — Account Security UI Polish
```

No new npm dependency is required.

## 1. Change account email removed from the Android app

Localsewa now treats linked account email as fixed in the Android app.

Removed from Customer navigation:

```text
ChangeEmail
```

Removed from Account Security UI:

```text
Change account email
```

The app-side account-security API/hook wrappers for email change are also
removed from this build.

The backend itself is not modified by this Android patch.

## 2. Linked mobile number is no longer editable

`Edit profile` no longer contains an editable Mobile Number field.

The current linked mobile number is preserved in the existing profile update
request, but the Customer cannot change it from the Android UI.

The profile editor now makes the policy explicit:

```text
Your account email and mobile number cannot be changed after they are linked
to your Localsewa account.
```

Email and mobile remain visible on Profile as account identity information.

## 3. Change Password is now a popup

The separate:

```text
ChangePassword
```

navigation page is removed.

Tapping:

```text
Account Security
→ Change password
```

now opens an in-place modal.

Flow inside the popup:

```text
Current password
→ Send verification code
→ Email OTP
→ New password
→ Confirm password
→ Change password
```

The existing real backend endpoints and validation remain unchanged.

Successful password change still revokes active sessions and clears the local
session, so the Customer must sign in again.

## 4. Set Password is now a popup

The separate:

```text
SetPassword
```

navigation page is removed.

For Google-linked accounts, tapping:

```text
Account Security
→ Set a password
```

opens the same shared password modal in Set Password mode.

Flow:

```text
Send verification code
→ Email OTP
→ New password
→ Confirm password
→ Set password
```

The existing real Set Password backend flow remains unchanged.

Because the Profile API still does not expose a reliable `hasPassword` field,
the existing Google-linked visibility rule is preserved rather than inventing
password state.

If an account already has a password, the backend remains authoritative and
can reject the Set Password request.

## 5. One shared password modal

Added:

```text
src/components/account/PasswordSecurityModal.tsx
```

Both Change Password and Set Password now use this shared component.

The modal includes:

- popup overlay
- close control
- current password where required
- OTP request
- masked email status
- resend countdown
- resend action
- new password
- confirm password
- existing validation
- backend error display
- session-revocation behavior

## 6. Separate password/email pages removed from navigation

Removed routes:

```text
ChangePassword
SetPassword
ChangeEmail
```

Removed navigator registrations and Customer screen exports.

### Delete these old source files once

After copying the patch, delete from Android Studio Project view:

```text
src/screens/customer/ChangePasswordScreen.tsx
src/screens/customer/SetPasswordScreen.tsx
src/screens/customer/ChangeEmailScreen.tsx
```

Right-click each file → Delete → OK.

The app will no longer import or navigate to them even before deletion, but
removing them completes the cleanup.

## 7. Need Help added at the bottom

The technical password-capability note has been removed from Account Security.

At the bottom, Account Security now shows a lightweight text treatment:

```text
Need help with account security?  Get help
```

`Get help` opens the existing Help & Support page.

It intentionally does not look like another settings card/button.

## 8. Account Security layout

Current structure:

```text
Green Customer Header

Account security
Account email / verification badges

PASSWORD
Change password
Set a password (Google-linked accounts)

SESSIONS
Sign out all devices

ACCOUNT
Delete account

Need help with account security? Get help

Customer Bottom Navigation
(Profile active)
```

## Files added

```text
src/components/account/PasswordSecurityModal.tsx
```

## Files replaced

```text
src/components/account/index.ts

src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/EditCustomerProfileScreen.tsx
src/screens/customer/index.ts

src/navigation/types.ts
src/navigation/CustomerNavigator.tsx

src/hooks/useAccountSecurity.ts
src/api/accountSecurityApi.ts
```

## Files to delete manually

```text
src/screens/customer/ChangePasswordScreen.tsx
src/screens/customer/SetPasswordScreen.tsx
src/screens/customer/ChangeEmailScreen.tsx
```

## Dependencies

No npm install.

## Install

1. Keep v1.10.17 as the current baseline.
2. Copy/replace this ZIP into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. In Android Studio Project view delete the three obsolete screens listed
   above.
4. Do not run npm install.
5. Run normally from Android Studio.

## QA

### Account Security

Confirm:

- Change account email row is gone
- Change password opens a popup, not a new page
- Set a password opens a popup, not a new page
- popup can close with X / Android Back
- OTP request works
- resend countdown works
- password validation works
- successful password mutation signs the Customer out
- Sign out all devices still works
- Delete account still opens Account Deletion
- Need help text appears at the bottom
- Get help opens Help & Support

### Edit Profile

Confirm:

- no editable Email field
- no editable Mobile Number field
- Full name remains editable
- existing WhatsApp field remains editable
- saving profile preserves the linked mobile number

## Syntax validation

All TypeScript/TSX files in this patch passed a TypeScript transpile syntax
check before packaging.

## Next Profile module work

After this Account Security flow is approved:

```text
Default Location UI polish
Edit Profile UI polish / final consistency
Account Deletion shell consistency
```

Then the Customer Profile module can be frozen.
