import * as Keychain from 'react-native-keychain';

export type ProviderThemePreference = 'premium' | 'standard';

const USERNAME = 'provider-theme-preference';

function serviceFor(userId: number | string): string {
  return `com.localsewa.provider.theme.${String(userId)}`;
}

export const providerThemePreferenceStorage = {
  async read(
    userId: number | string,
  ): Promise<ProviderThemePreference | null> {
    const saved = await Keychain.getGenericPassword({
      service: serviceFor(userId),
    });

    if (!saved) {
      return null;
    }

    return saved.password === 'premium' || saved.password === 'standard'
      ? saved.password
      : null;
  },

  async save(
    userId: number | string,
    preference: ProviderThemePreference,
  ): Promise<void> {
    await Keychain.setGenericPassword(USERNAME, preference, {
      service: serviceFor(userId),
    });
  },
};
