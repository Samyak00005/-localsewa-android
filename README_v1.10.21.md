# Localsewa Android v1.10.21 — Inline Profile Edit, Photo & Location Popup

## Base

Apply over the current working:

```text
v1.10.20 — Account Security Build Recovery Hotfix
```

This release was built against the user-supplied complete v1.10.20 React Native source plus the separately supplied `android/` source.

## No npm dependency added

No `npm install` is required.

Profile photo selection uses a small Localsewa-owned Android native module and the Android system photo picker. No third-party image-picker package is added.

---

## 1. Edit Profile no longer opens a new page

The existing Profile page remains the account hub.

Old flow:

```text
Profile
→ Edit profile
→ separate Edit Profile screen
```

New flow:

```text
Profile
→ Edit profile
→ the existing details card becomes editable inline
```

Editable fields:

```text
Full name
WhatsApp (optional)
```

Locked account identity fields remain visible inside the same edit card:

```text
Email   LINKED
Mobile  LINKED
```

Email and linked mobile are not editable.

Actions remain inside the same card:

```text
Cancel
Save changes
```

The old `EditCustomerProfileScreen.tsx` and route are deliberately left in the project as compatibility code. The normal Profile UI no longer navigates to it.

---

## 2. Profile photo editing added

The circular profile photo now has a small camera/edit control at its lower-right edge.

Tap it to open the Android system photo picker.

The native flow:

```text
Android system photo picker
→ selected image decoded locally
→ EXIF orientation applied
→ image scaled to max 1600 px
→ re-encoded as JPEG
→ embedded EXIF/device metadata is not copied
→ uploaded to Localsewa
```

The prepared file is kept below the backend's 5 MB upload limit.

Backend flow used:

```text
POST /api/profile/image
multipart field: image
```

After upload, the app re-fetches the canonical customer profile so the displayed image URL comes from the backend response state rather than a temporary local preview.

### Android permissions

No broad storage permission is added.

- Android 13+ uses the system Photo Picker.
- Older supported Android versions use the system document picker fallback.

---

## 3. Native Android photo picker bridge

New native files:

```text
android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerModule.kt
android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerPackage.kt
```

`MainApplication.kt` manually registers:

```text
ProfilePhotoPickerPackage()
```

This is required because the module is part of the app source and is not an npm/autolinked package.

---

## 4. Default Location is now a popup

`DefaultLocation` remains a navigation route for compatibility, but its presentation is now:

```text
transparentModal + fade
```

So these existing entry points all get the same popup UX:

```text
Profile → Default location
Home → location entry
Sidebar → Default Location
```

The popup contains:

```text
Default location
Address
Verify address
Verified area
Save location
```

The existing verified-location flow is reused:

```text
/api/location/validate
PUT /api/profile/location
```

The user cannot save an unverified typed address.

---

## 5. Profile card behavior

Normal state:

```text
[circular photo + camera control]
Name
Email
Mobile
verification badges
[ Edit profile ]

Name
Email
Mobile
```

Edit state:

```text
[circular photo + camera control]
Name
Email
Mobile
verification badges

Edit profile details
Full name            [ editable ]
WhatsApp             [ editable ]
Email                LINKED
Mobile               LINKED
[ Cancel ] [ Save changes ]
```

No duplicate Edit Profile page is opened.

---

## 6. Account settings text cleanup

Account Security subtitle on Profile now reads:

```text
Password, sessions and account deletion
```

It no longer implies account email can be changed from the app.

---

## Files added

```text
src/native/profilePhotoPicker.ts

android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerModule.kt
android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerPackage.kt
```

## Files replaced

```text
src/screens/customer/CustomerProfileScreen.tsx
src/screens/customer/DefaultLocationScreen.tsx
src/navigation/CustomerNavigator.tsx
src/api/accountApi.ts
src/hooks/useAccount.ts
src/types/account.ts
src/components/icons/AppIcon.tsx

android/app/src/main/java/com/localsewaapp/MainApplication.kt
```

## Files intentionally NOT deleted

Keep these compatibility screens:

```text
src/screens/customer/EditCustomerProfileScreen.tsx
src/screens/customer/DefaultLocationScreen.tsx   (replaced with popup implementation)
```

Do not remove old navigation contracts in this release.

---

## Install — Android Studio only

1. Keep your working v1.10.20 project as the base.
2. Extract this ZIP.
3. Copy its `src/` and `android/` folders into the Localsewa project root.
4. Allow replacement of matching files.
5. Do **not** run `npm install`.
6. Because native Kotlin code was added, Fast Refresh is not enough.
7. In Android Studio use:

```text
Build → Clean Project
```

then:

```text
Build → Rebuild Project
```

then run the app normally from Android Studio.

No terminal/PowerShell step is required.

---

## QA checklist

### Inline Profile editing

- Profile → Edit profile stays on Profile tab.
- No separate Edit Profile page opens.
- Full name can be edited.
- WhatsApp can be edited.
- Email is shown as linked and cannot be edited.
- Mobile is shown as linked and cannot be edited.
- Cancel restores normal view.
- Save updates the real profile and returns to normal view.

### Profile photo

- Tap camera control on circular profile image.
- Android system picker opens.
- Canceling picker causes no error.
- Selecting JPG/PNG/WebP on the test device prepares the image.
- Upload loading state appears on the camera control.
- New profile photo appears after backend refresh.
- Restart app and confirm the uploaded image persists.

### Default Location popup

Test from all current entry points:

```text
Profile
Home
Sidebar
```

Confirm:

- popup appears over current screen
- no full Default Location page transition
- backdrop/X closes popup
- current saved location pre-fills the field
- changing text invalidates previous verification
- Verify address works
- Save is disabled before verification
- Save updates Profile/Home location state

### Regression

Confirm:

- Profile bottom tab remains selected
- Account Security still opens
- Logout still works
- Provider role switch still works
- Help / Terms / Privacy still open
- Home and sidebar location links still work, now as popup

---

## Validation completed before packaging

Modified TypeScript/TSX files:

```text
syntax diagnostics: 0
missing relative imports in merged v1.10.20 source: 0
```

The Android native module follows React Native's standard app-local `ReactPackage` registration and `BaseActivityEventListener` activity-result pattern.

A real Android Gradle compile must still be performed in your Android Studio environment because the uploaded source intentionally did not include the full project `node_modules` tree or Android SDK toolchain.

---

## Next

After v1.10.21 real-device QA passes:

```text
Account Deletion shell consistency
Profile module final regression
Profile module freeze
```

Then continue with:

```text
Provider Details + Booking Request UI Polish
```
