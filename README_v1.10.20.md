# Localsewa Android v1.10.20 — Account Security Build Recovery Hotfix

## Apply over

```text
v1.10.19 — v1.10.18 Build Hotfix
```

No npm install is required.

## What was actually found

The uploaded v1.10.17, v1.10.18 and v1.10.19 ZIPs were compared directly.

v1.10.19 restored the three deleted password/email screens and restored the
older route/hook/API compatibility, but the release build still failed.

Four v1.10.18 files remained unchanged in v1.10.19:

```text
src/components/account/PasswordSecurityModal.tsx
src/components/account/index.ts
src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/EditCustomerProfileScreen.tsx
```

Therefore the deleted pages were not the root cause.

The strongest remaining regression surface is the new
`PasswordSecurityModal` module/barrel integration.

## Hotfix strategy

This hotfix deliberately returns to the **v1.10.17 working Account Security
structure** and makes the smallest possible UI changes.

### Password popup remains

The Customer still gets popup behavior:

```text
Change password -> popup
Set a password -> popup
```

But the popup does NOT use the new v1.10.18 PasswordSecurityModal module.

Instead, Account Security renders the already-existing, previously working:

```text
ChangePasswordScreen
SetPasswordScreen
```

inside an inline native Modal.

That reuses the known-working OTP/password logic and avoids introducing a new
password module into the release bundle graph.

## Important compatibility rule

Do NOT delete:

```text
src/screens/customer/ChangePasswordScreen.tsx
src/screens/customer/SetPasswordScreen.tsx
src/screens/customer/ChangeEmailScreen.tsx
```

For this recovery build they remain internal compatibility screens.

The Customer-facing Account Security UI does NOT show Change Email.

The Change Password / Set Password rows open a popup instead of navigating to
the old pages.

## Account barrel recovery

`src/components/account/index.ts` no longer exports:

```text
PasswordSecurityModal
```

The old `PasswordSecurityModal.tsx` is replaced with a tiny harmless
compatibility stub so even a stale reference cannot pull the previous modal
implementation back into the release graph.

## Email / mobile policy

Edit Profile still follows the requested rule:

```text
Email  -> not editable
Mobile -> not editable
```

The linked mobile value is preserved during profile update.

## Need Help

Account Security bottom still shows:

```text
Need help with account security? Get help
```

`Get help` opens Help & Support.

## User-facing Account Security

```text
Account email

PASSWORD
Change password -> popup
Set a password -> popup (Google-linked account)

SESSIONS
Sign out all devices

ACCOUNT
Delete account

Need help with account security? Get help
```

## Files replaced

```text
src/screens/customer/AccountSecurityScreen.tsx
src/screens/customer/EditCustomerProfileScreen.tsx
src/components/account/index.ts
src/components/account/PasswordSecurityModal.tsx
```

No navigation/type/hook/API files are replaced by this hotfix.

## Validation performed

A merged current-source snapshot was checked after applying this hotfix:

```text
TypeScript/TSX syntax diagnostics: 0
Missing relative imports: 0
```

## Install

1. Keep your current v1.10.19 project.
2. Copy/replace this ZIP into:

```text
E:\Projects\Localsewa\LocalsewaAndroid\LocalsewaApp
```

3. Do NOT delete any password/email screen files.
4. Do NOT run npm install.
5. Android Studio:

```text
Build -> Clean Project
```

then:

```text
Build -> Rebuild Project
```

## If this build succeeds

Then we have isolated the regression to the v1.10.18 modal/module integration.

After that we can continue Profile child-page polish without touching the
working release bundle graph.
