# Localsewa Android v1.10.37 — Native Icon & Version Hotfix

## Base

Apply over:

`v1.10.36 — Provider Business Profile Redesign`

This patch changes Android native resources/configuration.

No npm install.

## 1. Launcher / splash icon issue

### Root cause

The current adaptive icon foreground is an opaque rounded-square/squircle
artwork. Android then applies its own launcher mask around that artwork.

On Android 12+ splash the icon background was also the same blue as the full
splash background, so the circular system icon plate was visually lost and the
inner squircle looked like the icon itself had been cut at the top.

### Fix

- Adaptive launcher now uses the existing round Localsewa asset inside the
  Android adaptive safe zone.
- Launcher background uses a slightly lighter Localsewa blue so the circular
  icon silhouette remains visible.
- Android 12+ splash icon plate uses the same lighter blue.
- Pre-Android-12 splash uses the round launcher asset instead of the old
  squircle splash bitmap.
- Pre-v26 standard `ic_launcher.png` files also use the round assets.

No new logo artwork or external dependency is added.

## 2. Android App info version

### Root cause

`android/app/build.gradle` was still:

```gradle
versionCode 1
versionName "1.0"
```

Android Settings reads the installed APK metadata from Gradle, not the ZIP
filename or README version.

### Fixed metadata

```gradle
versionCode 11037
versionName "1.10.37"
```

After rebuilding and reinstalling this build, Android App info should show:

`Version 1.10.37`

## Files added

- `android/app/src/main/res/drawable/ic_launcher_adaptive_foreground.xml`

## Files replaced

- `android/app/build.gradle`
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values-v31/styles.xml`
- `android/app/src/main/res/drawable/localsewa_launch_screen.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

## Install

Apply this patch over the current v1.10.36 project.

Because launcher resources and Gradle version metadata changed:

1. Android Studio -> Build -> Clean Project
2. Android Studio -> Build -> Rebuild Project
3. Uninstall the currently installed emulator app once if Android launcher
   keeps showing a cached old icon.
4. Run/install the newly rebuilt app.

No terminal command is required.

## QA

Check:

- Android splash icon no longer looks clipped at the top.
- App drawer/home launcher icon has a clean round silhouette.
- App info icon looks consistent.
- Android Settings -> App info shows Version 1.10.37.
- App opens normally after splash.
