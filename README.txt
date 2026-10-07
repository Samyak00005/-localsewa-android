LOCALSEWA ANDROID v1.1.1 — THEME HOTFIX

Why this hotfix exists:
During Fast Refresh, Metro can temporarily load the new colors.ts together
with the old v1.0 themes.ts. The old file expects exports such as `neutrals`,
so it can crash with "Cannot read property 'background' of undefined".

Replace BOTH:
- src/theme/colors.ts
- src/theme/themes.ts

The hotfix keeps the new 5-color palettes and also provides backward-compatible
aliases, making theme updates safe during Fast Refresh.

After copying:
1. Stop the app in Android Studio.
2. Run the app again.
3. If the red screen remains, use the emulator's Reload action once.
