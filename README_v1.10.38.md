# Localsewa Android v1.10.38 — Adaptive Icon Recovery Hotfix

## Base

Apply over:

`v1.10.37 — Native Icon & Version Hotfix`

This fixes the icon regression introduced in v1.10.37.

No npm install.

## What went wrong in v1.10.37

The adaptive icon helper referenced:

`@mipmap/ic_launcher_round`

while `ic_launcher_round.xml` itself was an adaptive icon resource.

That created a resource dependency loop / invalid adaptive foreground path.

Android therefore fell back to the default Android placeholder icon, which is
the blue grid + Android robot visible in the supplied screenshot.

## Correct fix

v1.10.38 restores a proper adaptive icon architecture:

- background layer = Localsewa blue
- foreground layer = direct transparent PNG artwork
- no adaptive resource references another adaptive icon
- no circular dependency
- legacy launcher icon uses the known-good round Localsewa PNG
- native splash uses a dedicated round Localsewa splash PNG

The transparent adaptive foreground contains the Localsewa house, tools,
location pin and green road/leaf mark without the old opaque blue squircle
background.

## Android 12+ splash

The splash uses:

- screen background: `#062388`
- adaptive icon plate: `#0A3DAA`
- real Localsewa adaptive launcher artwork

So the logo should remain visible as a proper icon instead of falling back to
the Android placeholder.

## App version

Android metadata is now:

```gradle
versionCode 11038
versionName "1.10.38"
```

Android Settings -> App info should therefore show:

`Version 1.10.38`

## Files replaced

- `android/app/build.gradle`
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values-v31/styles.xml`
- `android/app/src/main/res/drawable/localsewa_launch_screen.xml`
- `android/app/src/main/res/drawable/ic_launcher_adaptive_foreground.xml`
- `android/app/src/main/res/drawable-nodpi/localsewa_splash_logo.png`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`
- `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

## Install

Because launcher and splash resources changed:

1. Apply this ZIP over the current v1.10.37 project.
2. Android Studio -> Build -> Clean Project.
3. Android Studio -> Build -> Rebuild Project.
4. Uninstall the current Localsewa app from the emulator once.
5. Run/install the rebuilt app from Android Studio.

Uninstalling once is important because Android launchers aggressively cache app
icons.

No terminal command is required.

## QA

Confirm:

- app launcher icon is Localsewa, not Android robot
- app drawer icon is Localsewa
- Android 12+ splash shows Localsewa icon
- no top clipping / broken squircle
- App info shows Localsewa icon
- App info shows Version 1.10.38
