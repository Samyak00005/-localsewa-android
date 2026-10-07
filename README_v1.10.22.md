# Localsewa Android v1.10.22 — Profile Photo Picker Kotlin Hotfix

## Base

Apply over:

`v1.10.21 — Inline Profile Edit + Location Popup + Profile Photo`

No npm install is required.

## Build failure fixed

The v1.10.21 release failed in:

`:app:compileReleaseKotlin`

with errors in:

`ProfilePhotoPickerModule.kt`

The visible failures were:

- `onActivityResult overrides nothing`
- `Unresolved reference 'currentActivity'`
- `Argument type mismatch: Any, but Activity was expected`
- `Unresolved reference 'runOnUiThread'`
- `Unresolved reference 'startActivityForResult'`

These were all caused by two React Native 0.87.1 Kotlin API mismatches.

## Fix 1 — ActivityEventListener signature

Old:

`activity: Activity?`

Fixed:

`activity: Activity`

React Native 0.87.1 exposes the ActivityEventListener callback with a non-null
Activity parameter.

## Fix 2 — Current Activity access

Old:

`val activity = currentActivity`

Fixed:

`val activity = reactApplicationContext.currentActivity`

This restores the correct Activity type for:

- `createPhotoPickerIntent(activity)`
- `activity.runOnUiThread`
- `activity.startActivityForResult`

## File replaced

`android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerModule.kt`

## Install

1. Keep v1.10.21 as the current project.
2. Copy/replace this ZIP content into your LocalsewaApp project.
3. No npm install.
4. Android Studio:
   - Build -> Clean Project
   - Build -> Rebuild Project
5. Then Run normally.

## Expected result

`:app:compileReleaseKotlin` should no longer fail on
`ProfilePhotoPickerModule.kt`.

After the build passes, test:
- Profile photo camera/edit button
- Android system photo picker
- selected photo preview/upload
- inline Edit Profile
- Default Location popup
