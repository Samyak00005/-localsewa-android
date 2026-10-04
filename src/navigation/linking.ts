import {LinkingOptions} from '@react-navigation/native';

import {RootStackParamList} from './types';

/**
 * Route structure is deep-link ready.
 *
 * Native Android intent filters will be added later when notification/deep-link
 * handling is integrated. Keeping stable route names now prevents later
 * navigation rewrites.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['localsewa://'],
  config: {
    screens: {
      Auth: 'auth',
      Customer: 'customer',
      Provider: 'provider',
    },
  },
};
