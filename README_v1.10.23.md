# Localsewa Android v1.10.23 — Customer WhatsApp Removal

## Base

Apply over:

`v1.10.22 — Profile Photo Picker Kotlin Hotfix`

No npm install and no Android/native change is required.

## Change

WhatsApp has been removed from the Customer Profile editing experience because
Customer/Provider communication now uses Localsewa's In-App Chat.

### Inline Profile edit

Removed:

`WhatsApp (optional)`

The inline profile editor now focuses on the profile fields that still matter
to the Customer app.

### Legacy Edit Profile compatibility screen

WhatsApp has also been removed from the old compatibility
`EditCustomerProfileScreen.tsx` so it cannot reappear if that screen is reached
during future compatibility work.

## Backend compatibility

This Android patch does not modify the production database/backend schema.

When another profile field is saved, the app silently preserves any existing
legacy WhatsApp value returned by the backend instead of overwriting it with an
empty value.

The value is not displayed or editable in the Customer app.

This prevents an unrelated profile edit from mutating old account data while
the Android UI moves fully to In-App Chat.

## Files replaced

- `src/screens/customer/CustomerProfileScreen.tsx`
- `src/screens/customer/EditCustomerProfileScreen.tsx`

## Install

1. Keep v1.10.22 as the current working baseline.
2. Copy/replace this ZIP into the LocalsewaApp project.
3. No npm install.
4. No Clean/Rebuild is technically required because this patch is TypeScript
   only, but a normal Android Studio Run is fine.

## QA

Profile -> Edit profile:

- WhatsApp field must not appear.
- Name editing still works.
- Email remains locked.
- Mobile remains locked.
- Profile photo edit still works.
- Save/Cancel still work.
- In-App Chat behavior is unchanged.

## Next

After this small cleanup, continue Profile module final QA / Account Deletion
consistency and then freeze the Customer Profile module.
