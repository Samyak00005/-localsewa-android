export const sharedColors = {
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F0',
  border: '#DDE5E1',
  textSecondary: '#4A5B52',
  textMuted: '#66776E',
  disabled: '#93A39B',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const statusColors = {
  success: '#15803D',
  warning: '#B45309',
  error: '#B42318',
  info: '#1D4ED8',
} as const;

/**
 * Locked CUSTOMER palette.
 */
export const customerPalette = {
  text: '#102018',
  background: '#F7FAF8',
  primary: '#0F8449',
  secondary: '#DCEFE4',
  accent: '#20A85A',
} as const;

/**
 * Locked PROVIDER STANDARD palette.
 * This remains the base visual language for every Provider workspace,
 * including providers who currently have Localsewa+ entitlement.
 */
export const providerStandardPalette = {
  text: '#101B1A',
  background: '#F4F7F6',
  primary: '#0E3024',
  secondary: '#D7E3DF',
  accent: '#214035',
  pressed: '#09271D',
  subtle: '#EEF4F1',
} as const;

/**
 * Locked LOCALSEWA+ entitlement palette.
 * These colors are accents for premium membership indicators/surfaces only;
 * they do not replace the Provider Standard navigation/card language.
 */
export const localsewaPlusPalette = {
  text: '#111420',
  background: '#FBF7EE',
  primary: '#123C35',
  secondary: '#4A2F63',
  accent: '#D4AF57',
  deepEmerald: '#0C2D28',
  deepAubergine: '#322044',
  strongGold: '#B88A2B',
  softGold: '#F7E8BE',
  premiumIvory: '#FFFDF8',
} as const;

// Backward-compatible alias for modules that still use the old export name.
export const providerPremiumPalette = localsewaPlusPalette;

export const premiumExtras = {
  primaryDeep: localsewaPlusPalette.deepEmerald,
  secondaryDeep: localsewaPlusPalette.deepAubergine,
  goldStrong: localsewaPlusPalette.strongGold,
  goldSoft: localsewaPlusPalette.softGold,
  ivorySurface: localsewaPlusPalette.premiumIvory,
  surfaceTint: '#F4EEE4',
} as const;

/**
 * Backward-compatible aliases kept intentionally so Fast Refresh
 * cannot crash if Metro temporarily evaluates older theme modules.
 */
export const neutrals = {
  background: customerPalette.background,
  surface: sharedColors.surface,
  surfaceMuted: sharedColors.surfaceMuted,
  border: sharedColors.border,
  text: customerPalette.text,
  textSecondary: sharedColors.textSecondary,
  textMuted: sharedColors.textMuted,
  disabled: sharedColors.disabled,
  white: sharedColors.white,
  black: sharedColors.black,
} as const;

export const customerColors = {
  primary: customerPalette.primary,
  primaryPressed: '#0B6D3C',
  accent: customerPalette.accent,
  soft: customerPalette.secondary,
  subtle: '#F3FBF6',
} as const;

export const providerStandardColors = {
  primary: providerStandardPalette.primary,
  primaryPressed: providerStandardPalette.pressed,
  accent: providerStandardPalette.accent,
  soft: providerStandardPalette.secondary,
  subtle: providerStandardPalette.subtle,
} as const;

export const providerPremiumColors = {
  // Provider controls/navigation keep the Standard emerald family.
  primary: providerStandardPalette.primary,
  primaryPressed: providerStandardPalette.pressed,
  accent: providerStandardPalette.accent,
  soft: providerStandardPalette.secondary,
  subtle: providerStandardPalette.subtle,
  // Premium accents are entitlement-only.
  premiumGold: localsewaPlusPalette.accent,
  premiumGoldStrong: localsewaPlusPalette.strongGold,
  premiumGoldSoft: localsewaPlusPalette.softGold,
  premiumAubergine: localsewaPlusPalette.secondary,
  premiumDeepAubergine: localsewaPlusPalette.deepAubergine,
  premiumIvory: localsewaPlusPalette.premiumIvory,
} as const;
