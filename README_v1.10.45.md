# Localsewa Android v1.10.45 — Provider Gallery Width Hotfix

## Base

Apply over:

`v1.10.44 — Provider Gallery & Service Numbering`

## Root cause

The 16:9 gallery itself was carrying both:

- `marginHorizontal`
- `aspectRatio`

The measured gallery width could therefore be narrower than the actual available
inner profile-card width. Measuring it with `onLayout` only measured that
already-shrunken width, so the right-side gap remained.

## Structural fix

Old:

```tsx
<View
  style={{
    marginHorizontal: 12,
    aspectRatio: 16 / 9,
  }}
/>
```

New:

```tsx
<View style={styles.galleryInset}>
  <View style={styles.gallery}>
    ...
  </View>
</View>
```

The outer wrapper now owns spacing:

```ts
galleryInset: {
  width: '100%',
  paddingTop: 12,
  paddingHorizontal: 12,
}
```

The actual gallery always fills that wrapper's inner content width:

```ts
gallery: {
  width: '100%',
  alignSelf: 'stretch',
  aspectRatio: 16 / 9,
}
```

`onLayout` now measures the final real gallery width, and every horizontal photo
page uses that exact same width.

Expected result:

- 12dp left inset
- 12dp right inset
- no oversized right-side white gap
- 16:9 unchanged
- 18dp inner radius unchanged
- 30dp outer card radius unchanged
- paging/swipe unchanged
- `1 / N` counter unchanged
- service serial numbers from v1.10.44 unchanged

## Android version

- versionCode: 11045
- versionName: 1.10.45

## Files replaced

- `src/screens/customer/ProviderDetailsScreen.tsx`
- `android/app/build.gradle`

## Install

Apply over v1.10.44.

No npm install.
No Clean/Rebuild required.

Normal Android Studio Run is enough.
