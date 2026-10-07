# Localsewa Android v1.10.39 — Services, Provider & Schedule UI Polish

## Base

Apply over:

`v1.10.38 — Adaptive Icon Recovery Hotfix`

No npm package is required.

This version adds one small Android-native bridge for the Request Service
date/time dialogs.

## Changes

### All Services spacing
The vertical gap between the search bar and `Service categories` is increased.

### Service category cards
The repeated `LOCAL SERVICES` label is removed.

Cards now use:
- lighter green surface
- category name
- small icon
- provider count / Available soon
- arrow
- existing 4:3 ratio

The same shared card is used on Home Popular Services and All Services.

### Provider Details business gallery
The 16:9 gallery now has:
- 12dp inset
- rounded corners on all four sides
- existing swipe / full-screen behavior unchanged

### Customer header logo
Shared Customer header logo:
- old: 42x42
- new: 36x36

### Request Service date/time
Manual text-only date/time entry is replaced by real Android dialogs.

Date:
- native DatePickerDialog
- past dates disabled
- displays DD/MM/YYYY

Time:
- native TimePickerDialog
- 12-hour Android picker
- displays h:mm AM/PM

Backend payload remains unchanged:
- DD/MM/YYYY -> YYYY-MM-DD
- AM/PM -> HH:mm

No third-party date/time npm dependency was added.

## Native module

Added:

`LocalsewaDateTimePickerModule.kt`

Registered inside the already-existing:

`ProfilePhotoPickerPackage`

No new MainApplication package entry is required.

## Android version

- versionCode: 11039
- versionName: 1.10.39

## Files added

- android/app/src/main/java/com/localsewaapp/LocalsewaDateTimePickerModule.kt

## Files replaced

- android/app/build.gradle
- android/app/src/main/java/com/localsewaapp/ProfilePhotoPickerPackage.kt
- src/components/customer/HomeServiceCard.tsx
- src/components/navigation/CustomerHeader.tsx
- src/screens/customer/CustomerServicesScreen.tsx
- src/screens/customer/ProviderDetailsScreen.tsx
- src/screens/customer/BookingRequestScreen.tsx

## Install

Apply over v1.10.38.

No npm install.

Because Kotlin native code changed:
1. Android Studio -> Build -> Clean Project
2. Android Studio -> Build -> Rebuild Project
3. Run normally.

## QA

All Services:
- more space below search
- no repeated LOCAL SERVICES text
- category cards are lighter
- selected state still visible

Provider Details:
- business gallery is inset
- all 4 corners rounded
- gallery swipe/view still works

Header:
- logo is smaller
- Bell remains aligned

Request Service:
- Date tap opens Android calendar
- Time tap opens Android time picker
- Date renders DD/MM/YYYY
- Time renders AM/PM
- collapsed schedule summary updates
- booking submission still works
