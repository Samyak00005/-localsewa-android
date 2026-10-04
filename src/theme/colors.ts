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
 * CUSTOMER
 * Light, approachable Localsewa green system.
 */
export const customerPalette = {
  text: '#102018',
  background: '#F7FAF8',
  primary: '#0F8449',
  secondary: '#DCEFE4',
  accent: '#20A85A',
} as const;

/**
 * PROVIDER STANDARD
 * Uses the exact dark forest-green family from the approved provider UI reference.
 *
 * Reference dominant panel green:
 * RGB(14, 48, 36) = #0E3024
 *
 * Supporting darker-green surface:
 * RGB(33, 64, 53) = #214035
 */
export const providerStandardPalette = {
  text: '#101B1A',
  background: '#F4F7F6',
  primary: '#0E3024',
  secondary: '#D7E3DF',
  accent: '#214035',
} as const;

/**
 * PROVIDER LOCALSEWA+
 * Royal premium identity:
 * deep emerald + royal aubergine + champagne gold.
 */
export const providerPremiumPalette = {
  text: '#111420',
  background: '#FBF7EE',
  primary: '#123C35',
  secondary: '#4A2F63',
  accent: '#D4AF57',
} as const;

export const premiumExtras = {
  primaryDeep: '#0C2D28',
  secondaryDeep: '#322044',
  goldStrong: '#B88A2B',
  goldSoft: '#F7E8BE',
  ivorySurface: '#FFFDF8',
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
  primaryPressed: '#09271D',
  accent: providerStandardPalette.accent,
  soft: providerStandardPalette.secondary,
  subtle: '#EEF4F1',
} as const;

export const providerPremiumColors = {
  primary: providerPremiumPalette.primary,
  primaryPressed: premiumExtras.primaryDeep,
  accent: providerPremiumPalette.secondary,
  soft: premiumExtras.surfaceTint,
  subtle: premiumExtras.ivorySurface,
  premiumGold: providerPremiumPalette.accent,
  premiumGoldSoft: premiumExtras.goldSoft,
} as const;
