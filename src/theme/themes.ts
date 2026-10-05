import {
  customerPalette,
  premiumExtras,
  providerPremiumPalette,
  providerStandardPalette,
  sharedColors,
  statusColors,
} from './colors';

export type AppThemeMode = 'customer' | 'providerStandard' | 'providerPremium';

type BrandPalette = {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
};

type ThemeColors = BrandPalette & {
  surface: string;
  surfaceMuted: string;
  border: string;
  textSecondary: string;
  textMuted: string;
  disabled: string;
  onPrimary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  premiumPrimaryDeep?: string;
  premiumSecondaryDeep?: string;
  premiumGoldStrong?: string;
  premiumGoldSoft?: string;
  premiumIvorySurface?: string;
};

export type AppTheme = {
  mode: AppThemeMode;
  colors: ThemeColors;
};

const semanticColors = {
  surface: sharedColors.surface,
  surfaceMuted: sharedColors.surfaceMuted,
  border: sharedColors.border,
  textSecondary: sharedColors.textSecondary,
  textMuted: sharedColors.textMuted,
  disabled: sharedColors.disabled,
  onPrimary: sharedColors.white,
  success: statusColors.success,
  warning: statusColors.warning,
  error: statusColors.error,
  info: statusColors.info,
};

export const customerTheme: AppTheme = {
  mode: 'customer',
  colors: {
    ...customerPalette,
    ...semanticColors,
  },
};

export const providerStandardTheme: AppTheme = {
  mode: 'providerStandard',
  colors: {
    ...providerStandardPalette,
    ...semanticColors,
  },
};

export const providerPremiumTheme: AppTheme = {
  mode: 'providerPremium',
  colors: {
    ...providerPremiumPalette,
    ...semanticColors,
    premiumPrimaryDeep: premiumExtras.primaryDeep,
    premiumSecondaryDeep: premiumExtras.secondaryDeep,
    premiumGoldStrong: premiumExtras.goldStrong,
    premiumGoldSoft: premiumExtras.goldSoft,
    premiumIvorySurface: premiumExtras.ivorySurface,
  },
};

export const themes: Record<AppThemeMode, AppTheme> = {
  customer: customerTheme,
  providerStandard: providerStandardTheme,
  providerPremium: providerPremiumTheme,
};
