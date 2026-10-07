# Localsewa Android v2.0.1 — Locked Provider Design System Hotfix

Baseline: v2.0.0 Provider Profile / Reviews / Header / Bottom Navbar, originally reconstructed from v1.10.45.

## Purpose

This hotfix aligns the first Provider build with the locked Localsewa visual system. It does not redesign Customer UI and does not introduce a separate Localsewa+ navigation language.

## Locked palettes

### Customer
- text `#102018`
- background `#F7FAF8`
- primary `#0F8449`
- secondary `#DCEFE4`
- accent `#20A85A`

### Provider Standard
- text `#101B1A`
- background `#F4F7F6`
- primary `#0E3024`
- secondary `#D7E3DF`
- accent `#214035`
- pressed `#09271D`
- subtle `#EEF4F1`

### Localsewa+
Localsewa+ is an entitlement/accent layer over Provider Standard:
- text `#111420`
- background `#FBF7EE`
- primary `#123C35`
- secondary `#4A2F63`
- accent `#D4AF57`
- deep emerald `#0C2D28`
- deep aubergine `#322044`
- strong gold `#B88A2B`
- soft gold `#F7E8BE`
- premium ivory `#FFFDF8`

## v2.0.1 corrections

- Provider Standard remains the base theme whether Localsewa+ is active or not.
- Provider header remains dark emerald `#0E3024` for Standard and Plus.
- Provider bottom navigation remains the standard Provider emerald/surface system for Standard and Plus.
- Gold is no longer used as the general active navigation color.
- Premium ivory/gold are limited to explicit Localsewa+ membership indicators such as the tier badge and membership card.
- Aubergine/purple is retained as an available premium token but is not used as a general Provider card/navigation color.
- Provider pressed state is wired to `#09271D`.
- Provider subtle token is wired to `#EEF4F1`.
- Provider placeholder routes inherit the same Provider card/header conventions; Plus only adds the premium badge.
- Customer screen/component source files are unchanged by this hotfix.

## Android version

- `versionCode 20001`
- `versionName 2.0.1`
