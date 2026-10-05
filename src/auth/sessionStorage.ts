import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.localsewa.session';
const USERNAME = 'localsewa-api-token';
const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * Only the opaque API bearer token is persisted.
 *
 * Passwords and OTP values remain memory-only and are never written
 * to AsyncStorage, Keychain or files.
 */
export const sessionStorage = {
  async read(): Promise<string | null> {
    const saved = await Keychain.getGenericPassword({
      service: SERVICE,
    });

    if (!saved) {
      return null;
    }

    return TOKEN_PATTERN.test(saved.password) ? saved.password : null;
  },

  async save(token: string): Promise<void> {
    if (!TOKEN_PATTERN.test(token)) {
      throw new Error(
        'The server returned an invalid session. Please try again.',
      );
    }

    await Keychain.setGenericPassword(USERNAME, token, {
      service: SERVICE,
    });
  },

  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({
      service: SERVICE,
    });
  },
};
