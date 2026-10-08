# Localsewa Android v2.0.16 — Provider Services / Reviews / Media polish hotfix

Apply this patch over v2.0.15.

## Changes
- Services 16:9 Business Category card uses a second service-count stat block to reduce empty space without changing the locked visual language.
- Reviews 16:9 Overall Rating card uses a dedicated total-review stat block and cleaner footer copy.
- Provider service cards are more compact: smaller service title/price/description/action typography, smaller icon tile, tighter vertical spacing.
- Reviews with no written comment no longer show the placeholder “Rating submitted without a written comment.”
- Business Media Manager Move left / Move right now reorders the selected photo in the on-screen order instead of selecting the neighbouring photo. Selected photo stays selected and its index changes.
- Business photo large preview gets a subtle rounded-corner clip.
- Delete business photo always asks for confirmation before deletion.

## Backend boundary
The current backend exposes add, delete and set-cover, but no arbitrary gallery sort-order endpoint. Left/right ordering in this hotfix is an in-app/session order only; it is not falsely presented as server-persisted gallery ordering.

## Version
- versionName: 2.0.16
- versionCode: 20016
